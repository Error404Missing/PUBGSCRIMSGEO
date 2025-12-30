'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteResultButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("ნამდვილად გსურთ შედეგის წაშლა?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "შედეგის წაშლა ვერ მოხერხდა");
      } else {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-400 underline disabled:opacity-50"
    >
      {loading ? "წაიშლება..." : "წაშლა"}
    </button>
  );
}
