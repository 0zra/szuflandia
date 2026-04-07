import "server-only";
import { getSession } from "@/app/lib/session";

/**
 * Returns the authenticated user's ID or throws.
 * Use in every server action to enforce tenant scoping.
 */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  const userId = session?.userId;
  if (typeof userId !== "string") {
    throw new Error("Unauthorized");
  }
  return userId;
}
