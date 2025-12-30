'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, Users, Clock, Map } from "lucide-react";

interface Scrim {
  id: string;
  startTime: string;
  map: string;
  maxTeams: number;
  status: string;
  roomId?: string;
  roomPass?: string;
  slots: {
    slotNumber: number;
    team: {
        id: string;
        name: string;
        tag: string;
    }
  }[];
}

interface UserTeam {
    id: string;
    name: string;
    status: string;
}

export default function ScrimList({ scrims, userTeam, userId, requests = [], allowedScrimIds = [] }: { scrims: any[], userTeam: UserTeam | null, userId?: string, requests?: string[], allowedScrimIds?: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  

  async function unregister(scrimId: string) {
     if(!confirm("ნამდვილად გსურთ რეგისტრაციის გაუქმება?")) return;
     setLoading(scrimId);
     try {
        await fetch('/api/scrims/unregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scrimId }),
        });
        router.refresh();
     } finally {
        setLoading(null);
     }
  }

  async function requestPlay(scrimId: string) {
    if (!userTeam) {
      alert("გთხოვთ ჯერ შექმნათ გუნდი");
      return;
    }
    setLoading(`req-${scrimId}`);
    try {
      const res = await fetch('/api/scrims/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrimId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "შეცდომა მოთხოვნის გაგზავნისას");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function cancelRequest(scrimId: string) {
    setLoading(`req-${scrimId}`);
    try {
      const res = await fetch('/api/scrims/request', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrimId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "მოთხოვნის გაუქმება ვერ მოხერხდა");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-8">
        {scrims.map((scrim) => {
            const isRegistered = userTeam && scrim.slots.some((s: any) => s.team.id === userTeam.id);
            const userSlot = isRegistered ? scrim.slots.find((s: any) => s.team.id === userTeam.id) : null;
            
            return (
                <div key={scrim.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{String(scrim.map).split(',').join(' / ')}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${scrim.status === 'OPEN' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {scrim.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(scrim.startTime).toLocaleString('ka-GE')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {scrim.slots.length} / {scrim.maxTeams} გუნდი
                                </div>
                            </div>
                        </div>

                        {/* Room Info for Registered Users within access window */}
                        {isRegistered && allowedScrimIds.includes(scrim.id) && (
                            <div className="bg-neutral-800 p-3 rounded-lg border border-yellow-900/30">
                                <p className="text-xs text-yellow-500 font-bold mb-1">Room Info (Slot {userSlot?.slotNumber})</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Map className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-400">Map:</span>
                                        <span className="text-white">{String(scrim.map).split(',').join(' / ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-400">Start:</span>
                                        <span className="text-white">{new Date(scrim.startTime).toLocaleString('ka-GE')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">ID:</span>
                                        <span className="text-white font-mono">{scrim.roomId || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">Pass:</span>
                                        <span className="text-white font-mono">{scrim.roomPass || "-"}</span>
                                    </div>
                                </div>
                                {!scrim.roomId || !scrim.roomPass ? (
                                    <p className="text-xs text-gray-500 mt-1">ინფორმაცია მალე დაემატება...</p>
                                ) : null}
                            </div>
                        )}
                        {isRegistered && !allowedScrimIds.includes(scrim.id) && (
                            <div className="bg-neutral-800 p-3 rounded-lg border border-yellow-900/30">
                                <p className="text-xs text-gray-500">Room Info ხელმისაწვდომია 24 საათით სლოტში რეგისტრაციის შემდეგ.</p>
                            </div>
                        )}
                        
                        {isRegistered && (
                            <button 
                                onClick={() => unregister(scrim.id)}
                                disabled={loading === scrim.id}
                                className="text-xs text-red-500 hover:text-red-400 underline"
                            >
                                {loading === scrim.id ? "..." : "რეგისტრაციის გაუქმება"}
                            </button>
                        )}
                        {!isRegistered && userTeam && (
                          <div className="mt-2">
                            {requests.includes(scrim.id) ? (
                              <button
                                onClick={() => cancelRequest(scrim.id)}
                                disabled={loading === `req-${scrim.id}`}
                                className="text-xs text-yellow-500 hover:text-yellow-400 underline"
                              >
                                {loading === `req-${scrim.id}` ? "..." : "მოთხოვნის გაუქმება"}
                              </button>
                            ) : (
                              <button
                                onClick={() => requestPlay(scrim.id)}
                                disabled={loading === `req-${scrim.id}`}
                                className="text-xs text-green-500 hover:text-green-400 underline"
                              >
                                {loading === `req-${scrim.id}` ? "..." : "თამაშის მოთხოვნა"}
                              </button>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Slots Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: scrim.maxTeams }).map((_, i) => {
                            const slotNum = i + 1;
                            const slot = scrim.slots.find((s: any) => s.slotNumber === slotNum);
                            const isMyTeam = userTeam && slot?.team?.id === userTeam.id;

                            return (
                                <div 
                                    key={slotNum} 
                                    className={`
                                        relative p-3 rounded-lg border flex items-center justify-between
                                        ${slot 
                                            ? isMyTeam 
                                                ? 'bg-yellow-900/20 border-yellow-700' 
                                                : 'bg-neutral-800 border-neutral-700' 
                                            : 'bg-neutral-900/50 border-neutral-800 border-dashed'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-mono ${slot ? 'text-gray-500' : 'text-gray-700'}`}>#{slotNum}</span>
                                        {slot ? (
                                            <span className={`font-bold text-sm ${isMyTeam ? 'text-yellow-500' : 'text-white'}`}>
                                                {slot.team.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-600">თავისუფალი</span>
                                        )}
                                    </div>

                                    
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}

        {scrims.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                ამ მომენტისთვის სკრიმები არ არის დაგეგმილი.
            </div>
        )}
    </div>
  );
}
