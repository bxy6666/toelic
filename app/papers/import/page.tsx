import { PaperImportWorkspace } from "@/components/paper-domain-ui";
import { requireUserFromServer } from "@/lib/auth";
import { listPaperImports } from "@/lib/paper-import-service";

export default async function ImportPaperPage() {
  const user = await requireUserFromServer();
  const imports = await listPaperImports(user.id);

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Import Paper</p>
        <h1 className="text-3xl font-semibold tracking-normal">Upload Paper</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload a text PDF or DOCX, review the extracted questions, then create a
          draft version.
        </p>
      </div>
      <PaperImportWorkspace initialJobs={imports} />
    </div>
  );
}
