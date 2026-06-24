import { readFile } from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";

type SeedPaper = {
  sourceKey: string;
  title: string;
  description?: string;
  versionLabel: string;
  status?: "draft" | "published";
  defaultDurationSeconds?: number;
  sections: {
    sectionCode?: string;
    title: string;
    instructions?: string;
    orderIndex: number;
  }[];
  items: {
    sectionCode?: string;
    questionNo: string;
    itemType: "single_choice";
    stem: string;
    difficulty?: string;
    orderIndex: number;
    answer: { choice: string };
    explanation?: { zh?: string };
    options: {
      optionKey: string;
      optionText: string;
      orderIndex: number;
    }[];
  }[];
};

async function resolveSeedUser() {
  if (process.env.SEED_USER_ID) {
    const user = await prisma.user.findUnique({
      where: { id: process.env.SEED_USER_ID },
    });
    if (user) {
      return user;
    }
  }

  if (process.env.SEED_USERNAME) {
    const user = await prisma.user.findUnique({
      where: { username: process.env.SEED_USERNAME.toLowerCase() },
    });
    if (user) {
      return user;
    }
  }

  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    throw new Error("No user exists. Create a login user before seed:papers.");
  }

  return user;
}

async function readSeed(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as SeedPaper;
}

async function seedPaper(userId: string, seed: SeedPaper) {
  const existingPaper = await prisma.paper.findUnique({
    where: {
      userId_sourceKey: {
        userId,
        sourceKey: seed.sourceKey,
      },
    },
    include: { versions: true },
  });

  if (
    existingPaper?.versions.some(
      (version) => version.versionLabel === seed.versionLabel,
    )
  ) {
    return {
      sourceKey: seed.sourceKey,
      versionLabel: seed.versionLabel,
      skipped: true,
    };
  }

  const paper =
    existingPaper ??
    (await prisma.paper.create({
      data: {
        userId,
        sourceKey: seed.sourceKey,
        title: seed.title,
        description: seed.description ?? null,
      },
    }));

  const result = await prisma.$transaction(async (tx) => {
    const version = await tx.paperVersion.create({
      data: {
        paperId: paper.id,
        versionLabel: seed.versionLabel,
        status: seed.status === "draft" ? "draft" : "published",
        publishedAt: seed.status === "draft" ? null : new Date(),
        defaultDurationSeconds: seed.defaultDurationSeconds ?? 7200,
      },
    });

    const sectionByCode = new Map<string, string>();
    for (const section of seed.sections) {
      const created = await tx.paperSection.create({
        data: {
          paperVersionId: version.id,
          sectionCode: section.sectionCode ?? null,
          title: section.title,
          instructions: section.instructions ?? null,
          orderIndex: section.orderIndex,
        },
      });
      if (section.sectionCode) {
        sectionByCode.set(section.sectionCode, created.id);
      }
    }

    for (const item of seed.items) {
      const created = await tx.questionItem.create({
        data: {
          paperVersionId: version.id,
          sectionId: item.sectionCode
            ? sectionByCode.get(item.sectionCode) ?? null
            : null,
          questionNo: item.questionNo,
          itemType: item.itemType,
          stem: item.stem,
          answerKeyJson: JSON.stringify(item.answer),
          explanationJson: JSON.stringify(item.explanation ?? { zh: "" }),
          difficulty: item.difficulty ?? null,
          orderIndex: item.orderIndex,
        },
      });

      for (const option of item.options) {
        await tx.questionOption.create({
          data: {
            itemId: created.id,
            optionKey: option.optionKey,
            optionText: option.optionText,
            orderIndex: option.orderIndex,
          },
        });
      }
    }

    return version;
  });

  return {
    sourceKey: seed.sourceKey,
    versionLabel: result.versionLabel,
    skipped: false,
  };
}

async function main() {
  const user = await resolveSeedUser();
  const seedDir = path.join(process.cwd(), "data", "papers");
  const files = process.argv.slice(2);
  const targets =
    files.length > 0
      ? files
      : [path.join(seedDir, "toeic-sample-001.json")];

  for (const target of targets) {
    const filePath = path.isAbsolute(target) ? target : path.join(seedDir, target);
    const seed = await readSeed(filePath);
    const result = await seedPaper(user.id, seed);
    const action = result.skipped ? "SKIP" : "PASS";
    console.log(`${action} ${result.sourceKey} ${result.versionLabel}`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
