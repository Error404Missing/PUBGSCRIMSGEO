import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ requests: [] });
  }
  const team = await prisma.team.findUnique({ where: { leaderId: session.user.id } });
  if (!team) {
    return NextResponse.json({ requests: [] });
  }
  const items = await prisma.systemConfig.findMany({
    where: { key: { startsWith: `request:scrim:` } }
  });
  const list = items
    .filter(i => i.key.endsWith(`:team:${team.id}`))
    .map(i => {
      const parts = i.key.split(':');
      return parts[2]; // request:scrim:<scrimId>:team:<teamId>
    });
  return NextResponse.json({ requests: list });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const team = await prisma.team.findUnique({ where: { leaderId: session.user.id } });
  if (!team || team.status !== 'APPROVED') {
    return NextResponse.json({ message: "გუნდი არ არის დადასტურებული" }, { status: 400 });
  }
  const { scrimId } = await req.json();
  if (!scrimId) return NextResponse.json({ message: "Missing scrimId" }, { status: 400 });

  const existing = await prisma.systemConfig.findMany({
    where: { key: { startsWith: `request:scrim:` } }
  });
  const myRequests = existing.filter(i => i.key.endsWith(`:team:${team.id}`));
  if (myRequests.length >= 3) {
    return NextResponse.json({ message: "შეგიძლიათ მაქსიმუმ 3 მოთხოვნა" }, { status: 400 });
  }

  await prisma.systemConfig.upsert({
    where: { key: `request:scrim:${scrimId}:team:${team.id}` },
    update: { value: 'REQUESTED' },
    create: { key: `request:scrim:${scrimId}:team:${team.id}`, value: 'REQUESTED' }
  });

  return NextResponse.json({ message: "მოთხოვნა გაგზავნილია" });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const team = await prisma.team.findUnique({ where: { leaderId: session.user.id } });
  if (!team) {
    return NextResponse.json({ message: "No team" }, { status: 404 });
  }
  const { scrimId } = await req.json();
  if (!scrimId) return NextResponse.json({ message: "Missing scrimId" }, { status: 400 });

  await prisma.systemConfig.deleteMany({
    where: { key: `request:scrim:${scrimId}:team:${team.id}` }
  });

  return NextResponse.json({ message: "მოთხოვნა გაუქმებულია" });
}
