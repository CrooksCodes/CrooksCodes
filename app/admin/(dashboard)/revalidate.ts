import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin/routes";

/** Refresh every view that shows money after a write. */
export function revalidateMoney(clientId?: string) {
  if (clientId) revalidatePath(adminPath.client(clientId));
  revalidatePath(adminPath.clients);
  revalidatePath(adminPath.money);
  revalidatePath(adminPath.home);
  revalidatePath(adminPath.history);
}
