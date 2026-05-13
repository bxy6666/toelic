import { MistakesPanel } from "@/components/mistakes-panel";
import { listMistakes } from "@/lib/mistake-service";

export default async function MistakesPage() {
  const mistakes = await listMistakes();

  return <MistakesPanel initialMistakes={mistakes} />;
}
