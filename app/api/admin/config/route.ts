import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const configItems = await prisma.systemConfig.findMany();
    const config: any = {};
    
    configItems.forEach(item => {
        if (item.key === 'registrationOpen') config.registrationOpen = item.value === 'true';
        else config[item.key] = item.value;
    });

    return NextResponse.json(config);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'FOUNDER')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const entries = Object.entries(body);
    
    for (const [key, value] of entries) {
        await prisma.systemConfig.upsert({
            where: { key },
            update: { value: String(value ?? "") },
            create: { key, value: String(value ?? "") }
        });
    }

    return NextResponse.json({ message: "Saved" });
}
