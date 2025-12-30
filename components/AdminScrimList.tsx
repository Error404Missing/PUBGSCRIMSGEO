'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Trophy, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminScrimList({ scrims }: { scrims: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    
    // Result Modal State
    const [resultScrimId, setResultScrimId] = useState<string | null>(null);
    const [resultData, setResultData] = useState({ image: '', description: '' });

    async function deleteScrim(id: string) {
        if (!confirm("ნამდვილად გსურთ წაშლა?")) return;
        await fetch(`/api/admin/scrims?id=${id}`, { method: 'DELETE' });
        router.refresh();
    }

    async function saveRoomInfo(id: string) {
        await fetch('/api/admin/scrims', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id, 
                roomId: editData.roomId, 
                roomPass: editData.roomPass,
                status: editData.status,
                map: editData.map,
                startTime: editData.startTime
            }),
        });
        setEditingId(null);
        router.refresh();
    }

    async function addResult(e: React.FormEvent) {
        e.preventDefault();
        if (!resultScrimId) return;
        
        try {
            const res = await fetch('/api/admin/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...resultData, scrimId: resultScrimId }),
            });
            
            if (res.ok) {
                setResultScrimId(null);
                setResultData({ image: '', description: '' });
                alert("შედეგი წარმატებით დაემატა");
                router.refresh();
            } else {
                alert("შეცდომა შედეგების დამატებისას");
            }
        } catch (error) {
            console.error(error);
            alert("შეცდომა");
        }
    }

    return (
        <div className="overflow-x-auto relative">
            <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-900">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">თარიღი</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">მაპი</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">გუნდები</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Room Info</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">სტატუსი</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">მოქმედება</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                    {scrims.map((scrim) => (
                        <tr key={scrim.id} className="hover:bg-neutral-700/50">
                            <td className="px-4 py-3 text-sm whitespace-nowrap text-white">
                                {new Date(scrim.startTime).toLocaleString('ka-GE')}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-300">{String(scrim.map).split(',').join(' / ')}</td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                <span className="text-amber-500 font-mono">{scrim._count.slots}</span>
                                <span className="text-gray-500"> / {scrim.maxTeams}</span>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                <AnimatePresence initial={false}>
                                    {editingId === scrim.id ? (
                                        <motion.div 
                                            className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-inner"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    placeholder="ID" 
                                                    className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                                                    defaultValue={scrim.roomId}
                                                    onChange={e => setEditData({...editData, roomId: e.target.value})}
                                                />
                                                <input 
                                                    placeholder="Pass" 
                                                    className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                                                    defaultValue={scrim.roomPass}
                                                    onChange={e => setEditData({...editData, roomPass: e.target.value})}
                                                />
                                                <input 
                                                    placeholder="მაპი"
                                                    className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white col-span-2"
                                                    defaultValue={scrim.map}
                                                    onChange={e => setEditData({...editData, map: e.target.value})}
                                                />
                                                <input 
                                                    type="datetime-local"
                                                    className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white col-span-2"
                                                    defaultValue={new Date(scrim.startTime).toISOString().slice(0,16)}
                                                    onChange={e => setEditData({...editData, startTime: e.target.value})}
                                                />
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            className="flex flex-col text-xs"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <span className="text-gray-400">ID: <span className="text-white select-all">{scrim.roomId || '-'}</span></span>
                                            <span className="text-gray-400">Pass: <span className="text-white select-all">{scrim.roomPass || '-'}</span></span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {editingId === scrim.id ? (
                                    <select 
                                        defaultValue={scrim.status}
                                        onChange={e => setEditData({...editData, status: e.target.value})}
                                        className="bg-neutral-900 border border-neutral-600 rounded px-2 py-1 text-xs text-white"
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="FINISHED">FINISHED</option>
                                    </select>
                                ) : (
                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                        ${scrim.status === 'OPEN' ? 'bg-green-900/50 text-green-400 border border-green-900' : 
                                          scrim.status === 'CLOSED' ? 'bg-red-900/50 text-red-400 border border-red-900' : 
                                          'bg-gray-800 text-gray-400 border border-gray-700'}
                                    `}>
                                        {scrim.status}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {editingId === scrim.id ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => saveRoomInfo(scrim.id)} className="text-green-500 hover:text-green-400 p-1">
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditData({});
                                                }} 
                                                className="text-gray-400 hover:text-white p-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => router.push(`/admin/scrims/${scrim.id}`)}
                                                className="p-1.5 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 transition-colors"
                                                title="სლოტების მართვა"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingId(scrim.id);
                                                    setEditData({ 
                                                        roomId: scrim.roomId, 
                                                        roomPass: scrim.roomPass, 
                                                        status: scrim.status,
                                                        map: scrim.map,
                                                        startTime: new Date(scrim.startTime).toISOString().slice(0,16)
                                                    });
                                                }}
                                                className="p-1.5 bg-neutral-800 text-gray-400 rounded hover:bg-neutral-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setResultScrimId(scrim.id);
                                                }}
                                                className="p-1.5 bg-yellow-900/30 text-yellow-400 rounded hover:bg-yellow-900/50 transition-colors"
                                                title="შედეგების დამატება"
                                            >
                                                <Trophy className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => deleteScrim(scrim.id)}
                                                className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Result Modal */}
            {resultScrimId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md border border-neutral-700 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">შედეგის დამატება</h3>
                            <button onClick={() => setResultScrimId(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={addResult} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">სურათის URL</label>
                                <input 
                                    type="url" 
                                    required
                                    placeholder="https://imgur.com/..."
                                    className="w-full bg-neutral-900 border border-neutral-600 rounded p-2 text-white"
                                    value={resultData.image}
                                    onChange={e => setResultData({...resultData, image: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">აღწერა (არასავალდებულო)</label>
                                <textarea 
                                    placeholder="შენიშვნები..."
                                    className="w-full bg-neutral-900 border border-neutral-600 rounded p-2 text-white h-24"
                                    value={resultData.description}
                                    onChange={e => setResultData({...resultData, description: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 rounded transition"
                            >
                                დამატება
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
