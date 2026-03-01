import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all messages for current user
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "inbox" or "sent"

    const where: any = {};
    
    if (type === "inbox") {
      where.receiverId = userId;
    } else if (type === "sent") {
      where.senderId = userId;
    } else {
      // Get all messages where user is sender or receiver
      where.OR = [
        { receiverId: userId },
        { senderId: userId },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Send a new message
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { receiverId, receiverType, subject, content, senderType } = body;

    if (!receiverId || !subject || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        senderType: senderType || "TEACHER",
        receiverId,
        receiverType,
        subject,
        content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Mark message as read
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return new NextResponse("Message ID required", { status: 400 });
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error marking message as read:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
