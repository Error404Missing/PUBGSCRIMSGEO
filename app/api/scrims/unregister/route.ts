import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scrimId } = body;

    // Get user's team
    const team = await prisma.team.findUnique({
        where: { leaderId: session.user.id }
    });

    if (!team) {
        return NextResponse.json({ message: "Team not found" }, { status: 400 });
    }

    // Check if scrim allows unregister (e.g. not FINISHED)
    const scrim = await prisma.scrim.findUnique({ where: { id: scrimId } });
    if (!scrim || scrim.status === 'FINISHED') {
         return NextResponse.json({ message: "Cannot unregister" }, { status: 400 });
    }

    // Delete slot
    await prisma.slot.deleteMany({
        where: {
            scrimId,
            teamId: team.id
        }
    });
    await prisma.systemConfig.deleteMany({
        where: { key: `slot_assigned_at:${scrimId}:team:${team.id}` }
    });

    return NextResponse.json({ message: "Unregistered" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
