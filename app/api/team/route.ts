import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const blockUntil = await prisma.systemConfig.findUnique({ where: { key: `user:${session.user.id}:block_until` } });
  if (blockUntil?.value) {
    if (blockUntil.value === 'FOREVER') {
      return NextResponse.json({ message: "გუნდის გაუქმება შეზღუდულია" }, { status: 403 });
    }
    const until = new Date(blockUntil.value);
    if (until > now) {
      return NextResponse.json({ message: "გუნდის გაუქმება დროებით შეზღუდულია" }, { status: 403 });
    }
  }

  const team = await prisma.team.findUnique({
    where: { leaderId: session.user.id }
  });

  if (!team) {
    return NextResponse.json({ message: "No team" }, { status: 404 });
  }

  await prisma.team.delete({
    where: { id: team.id }
  });

  const cooldownUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await prisma.systemConfig.upsert({
    where: { key: `user:${session.user.id}:create_block_until` },
    update: { value: cooldownUntil.toISOString() },
    create: { key: `user:${session.user.id}:create_block_until`, value: cooldownUntil.toISOString() }
  });

  return NextResponse.json({ message: "Team cancelled" });
}
