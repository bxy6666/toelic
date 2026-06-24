import { redirect } from "next/navigation";

import { PracticeWorkspace } from "@/components/practice-workspace";
import { getCurrentUserFromServer } from "@/lib/auth";
import { getSettings } from "@/lib/settings-service";

export default async function ListeningPage() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    redirect("/login");
  }

  const settings = await getSettings(user.id);

  return <PracticeWorkspace practiceType="listening" initialSettings={settings} />;
}
