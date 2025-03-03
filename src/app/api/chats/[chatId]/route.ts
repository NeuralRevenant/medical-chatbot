import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { askEngine } from "@/lib/chatEngineApi";

interface Params {
  params: {
    chatId: string;
  };
}

// GET => Retrieve all messages for the chat
export async function GET(request: Request, { params }: Params) {
  const { chatId } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found or not your chat" },
        { status: 404 }
      );
    }
    return NextResponse.json({ messages: chat.messages });
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST => user sends a new message, store it, call the RAG engine, and store response
export async function POST(request: Request, { params }: Params) {
  const { chatId } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { content } = await request.json();
    if (!content.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // 1) Store user message
    const userMsg = await prisma.message.create({
      data: {
        chatId: chatId,
        role: "user",
        content,
      },
    });

    // 2) Call the semantic query engine
    const engineResp = await askEngine(content);
    const assistantContent = engineResp?.answer || "[No answer from engine]";

    // 3) Store assistant response
    const assistantMsg = await prisma.message.create({
      data: {
        chatId: chatId,
        role: "assistant",
        content: assistantContent,
      },
    });

    return NextResponse.json({ userMsg, assistantMsg });
  } catch (err: any) {
    console.error("Error storing message or calling engine:", err);
    return NextResponse.json(
      { error: "Failed to handle message" },
      { status: 500 }
    );
  }
}

// DELETE => Delete entire chat
export async function DELETE(request: Request, { params }: Params) {
  const { chatId } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found or not your chat" },
        { status: 404 }
      );
    }
    await prisma.chat.delete({ where: { id: chatId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting chat:", err);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
