import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2),
  tag: z.string().min(2).max(5),
  playerCount: z.coerce.number().min(1).max(10), 
  mapsCount: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, tag, playerCount, mapsCount } = teamSchema.parse(body);

    const isPrivileged = session.user.role === 'ADMIN' || session.user.role === 'FOUNDER';

    // Global registration toggle (non-privileged users)
    const regOpen = await prisma.systemConfig.findUnique({ where: { key: 'registrationOpen' } });
    if (!isPrivileged && regOpen && regOpen.value !== 'true') {
      return NextResponse.json({ message: "რეგისტრაცია დახურულია" }, { status: 403 });
    }

    const now = new Date();
    const blockUntil = await prisma.systemConfig.findUnique({ where: { key: `user:${session.user.id}:block_until` } });
    if (!isPrivileged && blockUntil?.value) {
      if (blockUntil.value === 'FOREVER') {
        return NextResponse.json({ message: "გუნდის შექმნა შეზღუდულია (სამუდამოდ)" }, { status: 403 });
      }
      const until = new Date(blockUntil.value);
      if (until > now) {
        return NextResponse.json({ message: `შექმნა დროებით შეზღუდულია (${until.toLocaleString('ka-GE')}-მდე)` }, { status: 403 });
      }
    }

    const createCooldown = await prisma.systemConfig.findUnique({ where: { key: `user:${session.user.id}:create_block_until` } });
    if (!isPrivileged && createCooldown?.value) {
      const until = new Date(createCooldown.value);
      if (until > now) {
        return NextResponse.json({ message: `შექმნა შეზღუდულია 24 საათით გაუქმების შემდეგ (${until.toLocaleString('ka-GE')}-მდე)` }, { status: 403 });
      }
    }

    // Check if user already has a team
    const existingTeam = await prisma.team.findUnique({
      where: { leaderId: session.user.id },
    });

    if (existingTeam) {
      return NextResponse.json({ message: "You already have a team" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        tag,
        playerCount,
        mapsCount,
        leaderId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
