import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Basic validation
    if (!name || name.length < 3 || !email || !password) {
      return NextResponse.json(
        { error: "A proper name, email, and password required." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 30) {
      return NextResponse.json(
        { error: "The password must be between 8 and 30 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 400 }
      );
    }

    // Hash password & create user in Postgres
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
      },
    });

    // Return the new user record
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err: any) {
    console.error("[REGISTER_POST_ERROR]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
