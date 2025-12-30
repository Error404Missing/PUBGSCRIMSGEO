import { prisma } from "@/lib/prisma";
import SlotManager from "@/components/SlotManager";

export default async function ScrimSlotsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const scrim = await prisma.scrim.findUnique({
        where: { id },
        include: { 
            slots: { include: { team: true } } 
        }
    });

    const requests = await prisma.systemConfig.findMany({
        where: { key: { startsWith: `request:scrim:${id}:team:` } }
    });
    const teamIds = requests.map(r => r.key.split(':').pop()!).filter(Boolean);
    const teams = teamIds.length > 0
        ? await prisma.team.findMany({
            where: { id: { in: teamIds } },
            orderBy: { name: 'asc' }
          })
        : [];

    if (!scrim) return <div className="text-white p-8">Scrim not found</div>;

    return <SlotManager scrim={scrim} teams={teams} />;
}
