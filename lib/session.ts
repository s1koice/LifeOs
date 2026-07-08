import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

/** Like requireUserId, but also loads the user row (needed for timezone-aware date logic). */
export async function requireUser() {
  const userId = await requireUserId();
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}
