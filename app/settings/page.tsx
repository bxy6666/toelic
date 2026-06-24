import { redirect } from "next/navigation";

import { SettingsPanel } from "@/components/settings-panel";
import { getCurrentUserFromServer } from "@/lib/auth";
import { getSettings } from "@/lib/settings-service";

export default async function SettingsPage() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    redirect("/login");
  }

  const settings = await getSettings(user.id);

  return <SettingsPanel initialSettings={settings} />;
}
