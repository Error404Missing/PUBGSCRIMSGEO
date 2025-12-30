'use client';

import { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        registrationOpen: true,
        announcement: "",
        contact_discord: "",
        contact_facebook: "",
        contact_telegram: "",
        support_email: "",
        info_email: "",
        homepage_title: "",
        homepage_subtitle: "",
        homepage_marketing: ""
        ,
        help_rules: "",
        help_faq: ""
    });
    const [blockUserId, setBlockUserId] = useState("");
    const [blockDays, setBlockDays] = useState<number>(1);
    const [blockPermanent, setBlockPermanent] = useState(false);
    const [blockInfo, setBlockInfo] = useState<{block_until?: string|null, create_block_until?: string|null}|null>(null);

    useEffect(() => {
        // Fetch config
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                if (data) setConfig(data);
            });
    }, []);

    async function saveConfig() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (res.ok) alert("პარამეტრები შენახულია");
            else alert("შეცდომა");
        } catch (e) {
            alert("შეცდომა");
        } finally {
            setLoading(false);
        }
    }

    async function fetchBlock() {
        if (!blockUserId) return;
        const res = await fetch(`/api/admin/blocks?userId=${encodeURIComponent(blockUserId)}`);
        if (res.ok) {
            const data = await res.json();
            setBlockInfo(data);
        }
    }

    async function applyBlock() {
        if (!blockUserId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blocks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: blockUserId, days: blockDays, permanent: blockPermanent }),
            });
            if (res.ok) {
                alert("ბლოკი განახლებულია");
                fetchBlock();
            } else {
                alert("შეცდომა ბლოკის განახლებისას");
            }
        } finally {
            setLoading(false);
        }
    }

    async function clearBlock() {
        if (!blockUserId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blocks', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: blockUserId }),
            });
            if (res.ok) {
                alert("ბლოკი და cooldown მოხსნილია");
                fetchBlock();
            } else {
                alert("შეცდომა მოხსნისას");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">სისტემური პარამეტრები</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">რეგისტრაციის სტატუსი</CardTitle>
                        <CardDescription>გლობალურად ჩართვა/გამორთვა</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setConfig({ ...config, registrationOpen: !config.registrationOpen })}
                                className={`px-4 py-2 rounded font-bold transition-colors ${
                                    config.registrationOpen 
                                        ? "bg-green-600 hover:bg-green-700 text-white" 
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                            >
                                {config.registrationOpen ? "რეგისტრაცია ღიაა" : "რეგისტრაცია დახურულია"}
                            </button>
                            <p className="text-sm text-gray-400">
                                {config.registrationOpen 
                                    ? "მომხმარებლებს შეუძლიათ გუნდების რეგისტრაცია" 
                                    : "ახალი გუნდების რეგისტრაცია შეჩერებულია"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">მთავარი შეტყობინება</CardTitle>
                        <CardDescription>გამოჩნდება მთავარ გვერდზე</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={config.announcement}
                            onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                            className="w-full h-32 bg-black border border-neutral-700 rounded p-3 text-white focus:border-amber-500 focus:outline-none"
                            placeholder="შეიყვანეთ ტექსტი..."
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">სოციალური ბმულები</CardTitle>
                        <CardDescription>Discord, Facebook, Telegram</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Discord</label>
                            <input 
                                type="url"
                                value={config.contact_discord || ""}
                                onChange={e => setConfig({ ...config, contact_discord: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="https://discord.gg/..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Facebook</label>
                            <input 
                                type="url"
                                value={config.contact_facebook || ""}
                                onChange={e => setConfig({ ...config, contact_facebook: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Telegram</label>
                            <input 
                                type="url"
                                value={config.contact_telegram || ""}
                                onChange={e => setConfig({ ...config, contact_telegram: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="https://t.me/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">საიტის ძირითადი ინფორმაცია</CardTitle>
                        <CardDescription>მთავარი გვერდის ტექსტები</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">სათაური</label>
                            <input 
                                value={config.homepage_title || ""}
                                onChange={e => setConfig({ ...config, homepage_title: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="მიმზიდველი სათაური..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">ქვესათაური</label>
                            <input 
                                value={config.homepage_subtitle || ""}
                                onChange={e => setConfig({ ...config, homepage_subtitle: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="მოკლე განმარტება..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">მარკეტინგული ტექსტი</label>
                            <textarea 
                                value={config.homepage_marketing || ""}
                                onChange={e => setConfig({ ...config, homepage_marketing: e.target.value })}
                                className="w-full h-24 bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="რატომ უნდა შემოუერთდეთ? ძლიერი არგუმენტები..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Support Email</label>
                            <input 
                                type="email"
                                value={config.support_email || ""}
                                onChange={e => setConfig({ ...config, support_email: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="support@prekebi.ge"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Info Email</label>
                            <input 
                                type="email"
                                value={config.info_email || ""}
                                onChange={e => setConfig({ ...config, info_email: e.target.value })}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="info@prekebi.ge"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">წესები</CardTitle>
                        <CardDescription>დახმარება/წესები გვერდის ტექსტი</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={config.help_rules || ""}
                            onChange={e => setConfig({ ...config, help_rules: e.target.value })}
                            className="w-full h-40 bg-black border border-neutral-700 rounded p-3 text-white"
                            placeholder="წესები, აკრძალვები, მითითებები..."
                        />
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">FAQ</CardTitle>
                        <CardDescription>ხშირად დასმული კითხვები</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={config.help_faq || ""}
                            onChange={e => setConfig({ ...config, help_faq: e.target.value })}
                            className="w-full h-40 bg-black border border-neutral-700 rounded p-3 text-white"
                            placeholder="FAQ პუნქტები..."
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">ბლოკების მართვა</CardTitle>
                        <CardDescription>მომხმარებლის ბლოკი/მოხსნა და cooldown-ის მოხსნა</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">მომხმარებლის ID</label>
                            <input
                                value={blockUserId}
                                onChange={(e) => setBlockUserId(e.target.value)}
                                className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                placeholder="userId"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">ბლოკის დღეები</label>
                                <input
                                    type="number"
                                    value={blockDays}
                                    onChange={(e) => setBlockDays(parseInt(e.target.value || '1', 10))}
                                    className="w-full bg-black border border-neutral-700 rounded p-2 text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">0 = სამუდამო</p>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    checked={blockPermanent || blockDays === 0}
                                    onChange={(e) => setBlockPermanent(e.target.checked)}
                                />
                                <span className="text-sm text-gray-300">სამუდამო ბლოკი</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={applyBlock}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                            >
                                {loading ? "მუშაობს..." : "დაბლოკვა/განახლება"}
                            </button>
                            <button
                                onClick={clearBlock}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                            >
                                {loading ? "მუშაობს..." : "ბლოკის მოხსნა + cooldown"}
                            </button>
                            <button
                                onClick={fetchBlock}
                                className="px-4 py-2 bg-neutral-800 text-white rounded"
                            >
                                სტატუსის ნახვა
                            </button>
                        </div>
                        {blockInfo && (
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>Block Until: {blockInfo.block_until || '-'}</p>
                                <p>Create Cooldown Until: {blockInfo.create_block_until || '-'}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={saveConfig}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {loading ? "ინახება..." : "შენახვა"}
                </button>
            </div>
        </div>
    );
}
