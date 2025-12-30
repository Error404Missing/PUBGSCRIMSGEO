import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  scrimId: z.string(),
  slotNumber: z.number().int().min(1).max(25), // Adjust max as needed
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scrimId, slotNumber } = registerSchema.parse(body);

    // Get user's team
    const team = await prisma.team.findUnique({
        where: { leaderId: session.user.id }
    });

    if (!team) {
        return NextResponse.json({ message: "გუნდი არ მოიძებნა" }, { status: 400 });
    }

    if (team.status !== 'APPROVED') {
        return NextResponse.json({ message: "გუნდი არ არის დადასტურებული" }, { status: 400 });
    }

    // Check if scrim is open
    const scrim = await prisma.scrim.findUnique({ where: { id: scrimId } });
    if (!scrim || scrim.status !== 'OPEN') {
        return NextResponse.json({ message: "რეგისტრაცია დახურულია" }, { status: 400 });
    }

    // Check if slot is taken
    const existingSlot = await prisma.slot.findUnique({
        where: {
            scrimId_slotNumber: { scrimId, slotNumber }
        }
    });

    if (existingSlot) {
        return NextResponse.json({ message: "სლოტი დაკავებულია" }, { status: 400 });
    }

    // Check if team is already registered for this scrim
    const existingRegistration = await prisma.slot.findFirst({
        where: {
            scrimId,
            teamId: team.id
        }
    });

    if (existingRegistration) {
        return NextResponse.json({ message: "უკვე რეგისტრირებული ხართ" }, { status: 400 });
    }

    // Register
    const slot = await prisma.slot.create({
        data: {
            scrimId,
            teamId: team.id,
            slotNumber
        }
    });

    return NextResponse.json(slot, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
