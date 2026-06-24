import { expect } from "vitest";

import { AppError } from "@/lib/errors";

type PostHandler = (request: Request) => Response | Promise<Response>;
type RouteLoader = () => Promise<{ POST: PostHandler }>;
type AuthResolverMock = {
  mockResolvedValue: (value: { id: string; username: string }) => unknown;
  mockRejectedValue: (error: unknown) => unknown;
};

export const acceptanceUser = {
  id: "user-1",
  username: "admin",
} as const;

export function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function createPostJsonAction(url: string, loadRoute: RouteLoader) {
  return async (body: unknown) => {
    const { POST } = await loadRoute();

    return POST(jsonRequest(url, body));
  };
}

export async function readJson<T = Record<string, unknown>>(response: Response) {
  return response.json() as Promise<T>;
}

export async function expectOkResponse(response: Response, status = 200) {
  const payload = await readJson(response);

  expect(response.status).toBe(status);
  expect(payload).toMatchObject({ ok: true });

  return payload;
}

export async function expectErrorResponse(
  response: Response,
  status: number,
  code: string,
) {
  const payload = await readJson(response);

  expect(response.status).toBe(status);
  expect(payload).toMatchObject({
    ok: false,
    error: { code },
  });

  return payload;
}

export function setUpAuthenticatedUser(
  requireUserFromRequest: AuthResolverMock,
  user = acceptanceUser,
) {
  requireUserFromRequest.mockResolvedValue({ ...user });
}

export function setUpUnauthenticatedUser(
  requireUserFromRequest: AuthResolverMock,
) {
  requireUserFromRequest.mockRejectedValue(
    new AppError("UNAUTHORIZED", "Login required", 401),
  );
}
