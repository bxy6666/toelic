import { StatsDashboard } from "@/components/stats-dashboard";
import { getStats } from "@/lib/stats-service";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getStats();

  return <StatsDashboard stats={stats} />;
}
