import { SettingsPanel } from "@/components/settings-panel";
import { getSettings } from "@/lib/settings-service";

export default async function SettingsPage() {
  const settings = await getSettings();

  return <SettingsPanel initialSettings={settings} />;
}
