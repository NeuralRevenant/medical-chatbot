import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ chats });
  } catch (err: any) {
    console.error("Error fetching chats:", err);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { title } = await request.json();
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Chat title is required" },
        { status: 400 }
      );
    }
    const newChat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
      },
    });
    return NextResponse.json(newChat);
  } catch (err: any) {
    console.error("Error creating chat:", err);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
