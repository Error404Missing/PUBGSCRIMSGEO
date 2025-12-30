'use client';

import { motion } from "framer-motion";
import { Calendar, KeyRound, Map } from "lucide-react";

export default function RoomInfoGrid({ slots }: { slots: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slots.map((s: any, idx: number) => (
        <motion.div
          key={s.id}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Map className="w-4 h-4" />
              <span>{String(s.scrim.map).split(',').join(' / ')}</span>
            </div>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Slot #{s.slotNumber}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">
                {new Date(s.scrim.startTime).toLocaleString('ka-GE')}
              </span>
            </div>
            {s.allowed ? (
              <>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white font-mono">{s.scrim.roomId || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Pass:</span>
                  <span className="text-white font-mono">{s.scrim.roomPass || "-"}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500">Room Info ხელმისაწვდომია 24 საათით სლოტში რეგისტრაციის შემდეგ.</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
