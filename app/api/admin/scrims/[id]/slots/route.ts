import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slotNumber, teamId } = body;

    if (!slotNumber || !teamId) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }
    const requestExists = await prisma.systemConfig.findUnique({
        where: { key: `request:scrim:${id}:team:${teamId}` }
    });
    if (!requestExists) {
        return NextResponse.json({ message: "ეს გუნდი არ აქვს გამოგზავნილი მოთხოვნა მოცემულ განრიგზე" }, { status: 400 });
    }

    // Check if slot is already taken
    const existingSlot = await prisma.slot.findFirst({
        where: { scrimId: id, slotNumber: Number(slotNumber) }
    });

    if (existingSlot) {
        // If team is already in this slot, do nothing
        if (existingSlot.teamId === teamId) return NextResponse.json({ message: "Already assigned" });
        
        // Remove old team from this slot
        await prisma.slot.delete({ where: { id: existingSlot.id } });
    }

    // Check if team is already in another slot for this scrim
    const teamInOtherSlot = await prisma.slot.findFirst({
        where: { scrimId: id, teamId }
    });

    if (teamInOtherSlot) {
        // Move team? Or error? Let's move them.
        await prisma.slot.delete({ where: { id: teamInOtherSlot.id } });
    }

    // Create new slot assignment
    const newSlot = await prisma.slot.create({
        data: {
            scrimId: id,
            teamId,
            slotNumber: Number(slotNumber)
        }
    });
    const assignedAt = new Date().toISOString();
    await prisma.systemConfig.upsert({
        where: { key: `slot_assigned_at:${id}:team:${teamId}` },
        update: { value: assignedAt },
        create: { key: `slot_assigned_at:${id}:team:${teamId}`, value: assignedAt }
    });
    await prisma.systemConfig.deleteMany({
        where: { key: `request:scrim:${id}:team:${teamId}` }
    });

    return NextResponse.json(newSlot);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slotNumber = searchParams.get('slot');

    if (slotNumber) {
        // Delete specific slot
        const slot = await prisma.slot.findFirst({
            where: { scrimId: id, slotNumber: Number(slotNumber) }
        });
        
        if (slot) {
            await prisma.slot.delete({ where: { id: slot.id } });
            await prisma.systemConfig.deleteMany({
                where: { key: `slot_assigned_at:${id}:team:${slot.teamId}` }
            });
        }
    } else {
        // Clear all slots (optional, if needed)
        await prisma.slot.deleteMany({ where: { scrimId: id } });
        await prisma.systemConfig.deleteMany({
            where: { key: { startsWith: `slot_assigned_at:${id}:team:` } }
        });
    }

    return NextResponse.json({ message: "Deleted" });
}
