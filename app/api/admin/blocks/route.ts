import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  const block = await prisma.systemConfig.findUnique({ where: { key: `user:${userId}:block_until` } });
  const cooldown = await prisma.systemConfig.findUnique({ where: { key: `user:${userId}:create_block_until` } });
  return NextResponse.json({
    block_until: block?.value || null,
    create_block_until: cooldown?.value || null,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId, days, permanent } = await req.json();
    if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    let value = "FOREVER";
    if (!permanent) {
      const d = typeof days === "number" && days > 0 ? days : 1;
      const until = new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
      value = until;
    }
    await prisma.systemConfig.upsert({
      where: { key: `user:${userId}:block_until` },
      update: { value },
      create: { key: `user:${userId}:block_until`, value },
    });
    return NextResponse.json({ message: "Block updated" });
  } catch (e) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    await prisma.systemConfig.deleteMany({ where: { key: `user:${userId}:block_until` } });
    await prisma.systemConfig.deleteMany({ where: { key: `user:${userId}:create_block_until` } });
    return NextResponse.json({ message: "Block and cooldown cleared" });
  } catch (e) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
