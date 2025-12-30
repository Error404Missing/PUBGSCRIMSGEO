'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Calendar, Map, Users } from 'lucide-react';

export default function CreateScrimForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);

  const MAP_OPTIONS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Taego", "Deston", "Rondo"];

  function toggleMap(map: string) {
    setSelectedMaps(prev => {
      if (prev.includes(map)) {
        return prev.filter(m => m !== map);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, map];
    });
  }

  async function onSubmit(data: any) {
    setLoading(true);
    try {
        if (selectedMaps.length === 0) {
            alert("აირჩიეთ მინიმუმ 1 მაპი");
            setLoading(false);
            return;
        }
        data.map = selectedMaps.join(',');
        await fetch('/api/admin/scrims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        reset();
        router.refresh();
    } catch (e) {
        console.error(e);
        alert("შეცდომა სკრიმის შექმნისას");
    } finally {
        setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900/50 p-6 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Plus className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-white text-lg">ახალი სკრიმის დამატება</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    თარიღი და დრო
                </label>
                <input 
                    type="datetime-local" 
                    required
                    {...register("startTime")}
                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
            </div>
            
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <Map className="w-3 h-3" />
                    აირჩიეთ მაპები (მაქს. 3)
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {MAP_OPTIONS.map((m) => {
                        const active = selectedMaps.includes(m);
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => toggleMap(m)}
                                className={`flex items-center justify-between px-3 py-2 rounded border transition ${
                                    active ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-neutral-700 bg-black/50 text-white'
                                }`}
                            >
                                <span>{m}</span>
                                {active && <Map className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </div>
                <div className="text-xs text-gray-400">
                    შერჩეული: {selectedMaps.join(' / ') || 'არცერთი'}
                </div>
            </div>

            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <Users className="w-3 h-3" />
                    მაქს. გუნდები
                </label>
                <input 
                    type="number" 
                    defaultValue={16}
                    {...register("maxTeams")}
                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
            </div>
        </div>

        <div className="mt-6 flex justify-end">
            <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {loading ? (
                    "ემატება..."
                ) : (
                    <>
                        <Plus className="w-5 h-5" />
                        დამატება
                    </>
                )}
            </button>
        </div>
    </form>
  );
}
