import { redirect } from "next/navigation";

import { MistakesPanel } from "@/components/mistakes-panel";
import { getCurrentUserFromServer } from "@/lib/auth";
import { listMistakes } from "@/lib/mistake-service";

export default async function MistakesPage() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    redirect("/login");
  }

  const mistakes = await listMistakes(user.id);

  return <MistakesPanel initialMistakes={mistakes} />;
}
