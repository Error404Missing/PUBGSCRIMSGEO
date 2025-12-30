import { prisma } from "@/lib/prisma";
import CreateScrimForm from "@/components/CreateScrimForm";
import AdminScrimList from "@/components/AdminScrimList";

export default async function AdminScrimsPage() {
  const scrims = await prisma.scrim.findMany({
    orderBy: { startTime: 'desc' },
    include: {
        _count: {
            select: { slots: true }
        }
    }
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">სკრიმების მართვა</h1>
      
      <CreateScrimForm />
      
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-700 bg-neutral-800">
            <h3 className="font-bold">არსებული სკრიმები</h3>
        </div>
        <AdminScrimList scrims={scrims} />
      </div>
    </div>
  );
}
