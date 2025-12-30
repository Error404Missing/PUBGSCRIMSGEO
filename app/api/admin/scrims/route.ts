import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { startTime, map, maxTeams } = body;

        const scrim = await prisma.scrim.create({
            data: {
                startTime: new Date(startTime),
                map,
                maxTeams: parseInt(maxTeams),
                status: "OPEN"
            }
        });

        return NextResponse.json(scrim);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, roomId, roomPass, status, map, startTime } = body;

        const scrim = await prisma.scrim.update({
            where: { id },
            data: {
                roomId,
                roomPass,
                status,
                ...(map ? { map } : {}),
                ...(startTime ? { startTime: new Date(startTime) } : {})
            }
        });

        return NextResponse.json(scrim);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    try {
        await prisma.scrim.delete({
            where: { id }
        });
        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
