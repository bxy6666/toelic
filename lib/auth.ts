import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "toeic_session";

const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 32;
const SESSION_DAYS = 7;

export type AuthUser = {
  id: string;
  username: string;
};

export function isPublicRegistrationEnabled() {
  return process.env.PUBLIC_REGISTRATION_ENABLED !== "false";
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function validateCredentials(username: string, password: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!/^[a-z0-9_-]{3,32}$/.test(normalizedUsername)) {
    throw new AppError(
      "REQUEST_INVALID",
      "用户名只能包含 3 到 32 位小写字母、数字、下划线或连字符。",
      400,
    );
  }

  if (password.length < 8 || password.length > 128) {
    throw new AppError("REQUEST_INVALID", "密码长度必须在 8 到 128 位之间。", 400);
  }

  return normalizedUsername;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    "sha256",
  ).toString("base64url");

  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsText, salt, expectedHash] = storedHash.split("$");

  if (algorithm !== "pbkdf2" || !iterationsText || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsText);

  if (!Number.isInteger(iterations) || iterations < 1) {
    return false;
  }

  const actual = Buffer.from(
    pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, "sha256").toString(
      "base64url",
    ),
  );
  const expected = Buffer.from(expectedHash);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookie(header: string | null, name: string) {
  if (!header) {
    return null;
  }

  const cookiesFromHeader = header.split(";").map((item) => item.trim());
  const prefix = `${name}=`;
  const cookie = cookiesFromHeader.find((item) => item.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function getSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

async function claimLegacyData(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.question.updateMany({ where: { userId: null }, data: { userId } });
    await tx.practiceRecord.updateMany({
      where: { userId: null },
      data: { userId },
    });
    await tx.mistake.updateMany({ where: { userId: null }, data: { userId } });

    const existingSetting = await tx.userSetting.findFirst({
      where: { userId },
    });
    const legacySetting = await tx.userSetting.findFirst({
      where: { userId: null },
      orderBy: { createdAt: "asc" },
    });

    if (!existingSetting && legacySetting) {
      await tx.userSetting.update({
        where: { id: legacySetting.id },
        data: { userId },
      });
    }
  });
}

export function setAuthCookie(
  response: Response & { cookies?: NextResponseCookies },
  token: string,
  expiresAt: Date,
) {
  response.cookies?.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearAuthCookie(
  response: Response & { cookies?: NextResponseCookies },
) {
  response.cookies?.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

type NextResponseCookies = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      expires: Date;
    },
  ) => void;
};

export async function loginOrSetup(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const userCount = await prisma.user.count();
  let setupCreated = false;
  let user = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (userCount === 0) {
    user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        passwordHash: hashPassword(password),
      },
    });
    setupCreated = true;
    await claimLegacyData(user.id);
  } else if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError("AUTH_FAILED", "用户名或密码不正确。", 401);
  }

  const session = await createSession(user.id);

  return {
    user: { id: user.id, username: user.username },
    setupCreated,
    ...session,
  };
}

export async function registerUser(username: string, password: string) {
  const normalizedUsername = validateCredentials(username, password);
  const userCount = await prisma.user.count();

  if (userCount > 0 && !isPublicRegistrationEnabled()) {
    throw new AppError("REGISTRATION_DISABLED", "当前未开放新用户注册。", 403);
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (existingUser) {
    throw new AppError("USER_ALREADY_EXISTS", "该用户名已被注册。", 409);
  }

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      passwordHash: hashPassword(password),
    },
  });

  const setupCreated = userCount === 0;

  if (setupCreated) {
    await claimLegacyData(user.id);
  }

  const session = await createSession(user.id);

  return {
    user: { id: user.id, username: user.username },
    setupCreated,
    ...session,
  };
}

export async function getCurrentUserFromToken(token: string | null) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
  } satisfies AuthUser;
}

export async function getCurrentUserFromRequest(request: Request) {
  return getCurrentUserFromToken(
    parseCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME),
  );
}

export async function requireUserFromRequest(request: Request) {
  const user = await getCurrentUserFromRequest(request);

  if (!user) {
    throw new AppError("UNAUTHORIZED", "请先登录后再继续操作。", 401);
  }

  return user;
}

export async function getCurrentUserFromServer() {
  const cookieStore = await cookies();
  return getCurrentUserFromToken(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);
}

export async function requireUserFromServer() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    throw new AppError("UNAUTHORIZED", "请先登录后再继续操作。", 401);
  }

  return user;
}

export async function logoutRequest(request: Request) {
  const token = parseCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME);

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }
}

export async function getAuthStatus(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  const userCount = await prisma.user.count();

  return {
    user,
    setupRequired: userCount === 0,
    registrationEnabled: userCount === 0 || isPublicRegistrationEnabled(),
  };
}

export async function isSetupRequired() {
  return (await prisma.user.count()) === 0;
}
