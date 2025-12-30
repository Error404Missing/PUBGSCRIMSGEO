'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shield, Search } from "lucide-react";
type AdminUser = {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string | Date;
    team?: { name: string; tag: string } | null;
};

export default function AdminUserList({ users, currentUserRole }: { users: AdminUser[], currentUserRole: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => 
            String(u.username).toLowerCase().includes(q) ||
            String(u.id).toLowerCase().includes(q)
        );
    }, [users, query]);

    async function updateRole(userId: string, newRole: string) {
        if (!confirm(`ნამდვილად გსურთ როლის შეცვლა: ${newRole}?`)) return;
        setLoading(userId);
        
        try {
            const res = await fetch('/api/admin/users/role', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "შეცდომა");
            } else {
                router.refresh();
            }
        } catch {
            alert("შეცდომა");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Search className="w-4 h-4" />
                    <span>ძებნა (სახელი ან ID)</span>
                </div>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="მაგ: user123 ან 1d2f3a..."
                    className="w-72 bg-black border border-neutral-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
            </div>
            <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">მომხმარებელი</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">გუნდი</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">როლი</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">რეგისტრაცია</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-700/50">
                            <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-400 font-mono select-all">
                                {user.id}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap font-medium text-white flex items-center gap-2">
                                <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs">
                                    {user.username[0].toUpperCase()}
                                </div>
                                {user.username}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-400">{user.email}</td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {user.team ? (
                                    <span className="text-yellow-500 font-mono text-xs">[{user.team.tag}] {user.team.name}</span>
                                ) : (
                                    <span className="text-gray-600 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {currentUserRole === 'FOUNDER' && user.role !== 'FOUNDER' ? (
                                    <select 
                                        disabled={loading === user.id}
                                        value={user.role}
                                        onChange={(e) => updateRole(user.id, e.target.value)}
                                        className={`bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs font-bold
                                            ${user.role === 'ADMIN' ? 'text-red-500 border-red-900' : 
                                              user.role === 'MANAGER' ? 'text-blue-500 border-blue-900' : 
                                              'text-gray-400'}
                                        `}
                                    >
                                        <option value="GUEST">GUEST</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                ) : (
                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit
                                        ${user.role === 'FOUNDER' ? 'bg-purple-900 text-purple-300' : 
                                          user.role === 'ADMIN' ? 'bg-red-900 text-red-300' : 
                                          user.role === 'MANAGER' ? 'bg-blue-900 text-blue-300' : 
                                          'bg-gray-800 text-gray-400'}
                                    `}>
                                        {user.role === 'FOUNDER' && <Shield className="w-3 h-3" />}
                                        {user.role}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap text-right text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString("ka-GE")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
