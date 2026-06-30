import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import {
  expectErrorResponse,
  expectOkResponse,
  setUpAuthenticatedUser,
  setUpUnauthenticatedUser,
} from "../test-utils";

const authMocks = vi.hoisted(() => ({
  requireUserFromRequest: vi.fn(),
}));

const importMocks = vi.hoisted(() => ({
  createPaperImport: vi.fn(),
  getPaperImport: vi.fn(),
  listPaperImports: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUserFromRequest: authMocks.requireUserFromRequest,
}));

vi.mock("@/lib/paper-import-service", () => ({
  createPaperImport: importMocks.createPaperImport,
  getPaperImport: importMocks.getPaperImport,
  listPaperImports: importMocks.listPaperImports,
}));

function uploadRequest() {
  const formData = new FormData();
  formData.set("file", new File(["demo"], "demo.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
  formData.set("title", "Demo");

  return new Request("http://localhost/api/paper-imports", {
    method: "POST",
    body: formData,
  });
}

function setUp() {
  vi.clearAllMocks();
  setUpAuthenticatedUser(authMocks.requireUserFromRequest);
  importMocks.createPaperImport.mockResolvedValue({
    id: "job-1",
    status: "ready",
    result: { items: [] },
  });
  importMocks.getPaperImport.mockResolvedValue({
    id: "job-1",
    status: "ready",
  });
  importMocks.listPaperImports.mockResolvedValue([
    {
      id: "job-1",
      status: "ready",
    },
  ]);
}

beforeEach(setUp);

describe("Acceptance: /api/paper-imports", () => {
  it("Scenario: POST uploads through the authenticated import service", async () => {
    const { POST } = await import("@/app/api/paper-imports/route");

    const response = await POST(uploadRequest());
    await expectOkResponse(response);

    expect(importMocks.createPaperImport).toHaveBeenCalledWith(
      "user-1",
      expect.any(FormData),
    );
  });

  it("Scenario: unauthenticated POST keeps the JSON error style", async () => {
    setUpUnauthenticatedUser(authMocks.requireUserFromRequest);
    const { POST } = await import("@/app/api/paper-imports/route");

    const response = await POST(uploadRequest());

    await expectErrorResponse(response, 401, "UNAUTHORIZED");
    expect(importMocks.createPaperImport).not.toHaveBeenCalled();
  });

  it("Scenario: service validation errors are preserved", async () => {
    importMocks.createPaperImport.mockRejectedValue(
      new AppError("UNSUPPORTED_DOCUMENT_TYPE", "Unsupported", 400),
    );
    const { POST } = await import("@/app/api/paper-imports/route");

    const response = await POST(uploadRequest());

    await expectErrorResponse(response, 400, "UNSUPPORTED_DOCUMENT_TYPE");
  });

  it("Scenario: GET reads only the authenticated user's job", async () => {
    const { GET } = await import("@/app/api/paper-imports/[jobId]/route");

    const response = await GET(new Request("http://localhost/api/paper-imports/job-1"), {
      params: Promise.resolve({ jobId: "job-1" }),
    });

    await expectOkResponse(response);
    expect(importMocks.getPaperImport).toHaveBeenCalledWith("user-1", "job-1");
  });

  it("Scenario: GET lists recent imports for the authenticated user", async () => {
    const { GET } = await import("@/app/api/paper-imports/route");

    const response = await GET(new Request("http://localhost/api/paper-imports"));
    const payload = await expectOkResponse(response);

    expect(importMocks.listPaperImports).toHaveBeenCalledWith("user-1");
    expect(payload).toMatchObject({
      data: [{ id: "job-1", status: "ready" }],
    });
  });
});
