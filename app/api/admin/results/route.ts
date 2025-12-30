import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scrimId, image, description } = await req.json();

    if (!scrimId || !image) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.result.create({
      data: {
        scrimId,
        image,
        description
      }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating result:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "FOUNDER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resultId } = await req.json();
    if (!resultId) {
      return NextResponse.json({ message: "Missing resultId" }, { status: 400 });
    }

    await prisma.result.delete({
      where: { id: resultId }
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
