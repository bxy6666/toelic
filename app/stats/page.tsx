import { redirect } from "next/navigation";

import { StatsDashboard } from "@/components/stats-dashboard";
import { getCurrentUserFromServer } from "@/lib/auth";
import { getStats } from "@/lib/stats-service";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await getCurrentUserFromServer();

  if (!user) {
    redirect("/login");
  }

  const stats = await getStats(user.id);

  return <StatsDashboard stats={stats} />;
}
