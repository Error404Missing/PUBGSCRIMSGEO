import { prisma } from "@/lib/prisma";
import { Users, Calendar, ShieldAlert, CheckCircle } from "lucide-react";

async function getAdminStats() {
    const totalTeams = await prisma.team.count();
    const pendingTeams = await prisma.team.count({ where: { status: "PENDING" } });
    const blockedTeams = await prisma.team.count({ where: { status: "BLOCKED" } });
    const totalUsers = await prisma.user.count();
    
    return { totalTeams, pendingTeams, blockedTeams, totalUsers };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-bold">მიმოხილვა</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">სულ გუნდები</p>
                        <h3 className="text-3xl font-bold">{stats.totalTeams}</h3>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">დასადასტურებელი</p>
                        <h3 className="text-3xl font-bold text-yellow-500">{stats.pendingTeams}</h3>
                    </div>
                    <CheckCircle className="w-8 h-8 text-yellow-500" />
                </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">დაბლოკილი</p>
                        <h3 className="text-3xl font-bold text-red-500">{stats.blockedTeams}</h3>
                    </div>
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
            </div>

            <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">მომხმარებლები</p>
                        <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                </div>
            </div>
        </div>

        {/* Recent Pending Teams */}
        <div>
            <h2 className="text-xl font-bold mb-4">ბოლო რეგისტრაციები</h2>
            {/* We will implement a proper table in the Teams section, this is just a placeholder */}
            <p className="text-gray-500">იხილეთ "გუნდები" განყოფილება დეტალური მართვისთვის.</p>
        </div>
    </div>
  );
}
