'use client';

import { Check, X, Ban, Crown, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  status: string;
  isVip: boolean;
}

export default function AdminTeamActions({ team }: { team: Team }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string, reason?: string) {
    if (loading) return;
    setLoading(true);
    try {
        await fetch('/api/admin/teams', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id, status, blockReason: reason }),
        });
        router.refresh();
    } finally {
        setLoading(false);
    }
  }

  async function toggleVip() {
    if (loading) return;
    setLoading(true);
    try {
        await fetch('/api/admin/teams', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id, isVip: !team.isVip }),
        });
        router.refresh();
    } finally {
        setLoading(false);
    }
  }

  async function deleteTeam() {
    if(!confirm("ნამდვილად გსურთ გუნდის წაშლა?")) return;
    if (loading) return;
    setLoading(true);
    try {
        await fetch('/api/admin/teams', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id }),
        });
        router.refresh();
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {team.status === 'PENDING' && (
        <>
            <button onClick={() => updateStatus('APPROVED')} title="Approve" className="p-1 bg-green-900/50 hover:bg-green-800 rounded text-green-400">
                <Check className="w-4 h-4" />
            </button>
            <button onClick={() => updateStatus('REJECTED')} title="Reject" className="p-1 bg-red-900/50 hover:bg-red-800 rounded text-red-400">
                <X className="w-4 h-4" />
            </button>
        </>
      )}
      
      {team.status !== 'BLOCKED' && (
        <button onClick={async () => {
            const reason = prompt("დაბლოკვის მიზეზი:");
            if(!reason) return;
            const daysStr = prompt("დაბლოკვის პერიოდი (დღეებში, 0 = სამუდამო):");
            const days = daysStr ? parseInt(daysStr, 10) : 1;
            const blockPermanent = days === 0 || Number.isNaN(days);
            const blockDays = blockPermanent ? undefined : days;
            if (loading) return;
            setLoading(true);
            try {
              await fetch('/api/admin/teams', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: team.id, status: 'BLOCKED', blockReason: reason, blockDays, blockPermanent }),
              });
              router.refresh();
            } finally {
              setLoading(false);
            }
        }} title="Block" className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-gray-400 hover:text-red-500">
            <Ban className="w-4 h-4" />
        </button>
      )}

      {team.status === 'BLOCKED' && (
        <button onClick={() => updateStatus('APPROVED')} title="Unblock" className="p-1 bg-green-900/50 hover:bg-green-800 rounded text-green-400">
            <Check className="w-4 h-4" />
        </button>
      )}

      <button onClick={toggleVip} title="Toggle VIP" className={`p-1 rounded ${team.isVip ? 'text-yellow-500 bg-yellow-900/20' : 'text-gray-500 hover:text-yellow-500 bg-neutral-800'}`}>
        <Crown className="w-4 h-4" />
      </button>

      <button onClick={deleteTeam} title="Delete" className="p-1 bg-neutral-800 hover:bg-red-900 rounded text-gray-500 hover:text-red-200">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
