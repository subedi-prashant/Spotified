import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { RequireCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  await RequireCurrentSession();
  return <AppShell>{children}</AppShell>;
}
