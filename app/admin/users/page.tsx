import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import AdminUserList from "@/components/AdminUserList";

export default async function AdminUsersPage() {
  const session = await auth();
  
  // Only FOUNDER should ideally see this or manage admins, but ADMINs might see users.
  // Let's allow ADMINs to see but not edit roles maybe?
  // Requirement: "Founder can assign admin roles"
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        team: {
            select: {
                name: true,
                tag: true
            }
        }
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">მომხმარებლების მართვა</h1>
        <span className="text-sm text-gray-500">სულ: {users.length}</span>
      </div>
      
      <AdminUserList users={users} currentUserRole={session?.user?.role || 'GUEST'} />
    </div>
  );
}
