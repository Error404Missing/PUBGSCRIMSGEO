import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { teamId, status, isVip, blockReason, blockDays, blockPermanent } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isVip === 'boolean') updateData.isVip = isVip;
    if (blockReason) updateData.blockReason = blockReason;
    
    // If approving, also make the leader a MANAGER
    if (status === 'APPROVED') {
        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (team) {
            await prisma.user.update({
                where: { id: team.leaderId },
                data: { role: 'MANAGER' }
            });
            await prisma.systemConfig.deleteMany({ where: { key: `user:${team.leaderId}:block_until` } });
            await prisma.systemConfig.deleteMany({ where: { key: `user:${team.leaderId}:create_block_until` } });
        }
    }
    
    // If blocking or rejecting, maybe revert role to GUEST if they were manager? 
    // Let's keep it simple for now, maybe they manage other teams? (Oh wait, 1 team per user).
    if (status === 'BLOCKED' || status === 'REJECTED') {
        const team = await prisma.team.findUnique({ where: { id: teamId } });
         if (team) {
            // Check if user is not admin/founder before downgrading
            const user = await prisma.user.findUnique({ where: { id: team.leaderId }});
            if (user && user.role !== 'ADMIN' && user.role !== 'FOUNDER') {
                await prisma.user.update({
                    where: { id: team.leaderId },
                    data: { role: 'GUEST' }
                });
            }
            if (status === 'BLOCKED') {
              const now = new Date();
              let value = 'FOREVER';
              if (!blockPermanent) {
                const days = typeof blockDays === 'number' && blockDays > 0 ? blockDays : 1;
                const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
                value = until.toISOString();
              }
              await prisma.systemConfig.upsert({
                where: { key: `user:${team.leaderId}:block_until` },
                update: { value },
                create: { key: `user:${team.leaderId}:block_until`, value }
              });
            }
        }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    return NextResponse.json(team);
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
  
    try {
      const body = await req.json();
      const { teamId } = body;
  
      await prisma.team.delete({
        where: { id: teamId },
      });
  
      return NextResponse.json({ message: "Team deleted" });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
