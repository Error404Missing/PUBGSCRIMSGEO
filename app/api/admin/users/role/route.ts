import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  
  if (session?.user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "მხოლოდ დამფუძნებელს შეუძლია როლების შეცვლა" }, { status: 403 });
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
        return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Prevent changing own role or other founders
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ message: "User not found" }, { status: 404 });
    
    if (targetUser.role === "FOUNDER") {
        return NextResponse.json({ message: "ვერ შეცვლით დამფუძნებლის როლს" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
