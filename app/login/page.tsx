import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/login-panel";
import {
  getCurrentUserFromServer,
  isPublicRegistrationEnabled,
  isSetupRequired,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUserFromServer();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  const setupRequired = await isSetupRequired();

  return (
    <LoginPanel
      setupRequired={setupRequired}
      registrationEnabled={setupRequired || isPublicRegistrationEnabled()}
      nextPath={nextPath}
    />
  );
}
