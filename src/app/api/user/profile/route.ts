import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// define a Zod schema for the update data
const updateSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    email: z.string().email("Invalid email."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(30, "Password cannot exceed 30 characters.")
        .optional(),
});

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // parse & validate the request body with zod
        const body = await req.json();
        const result = updateSchema.safeParse(body);

        if (!result.success) {
            // Provide the first zod validation error (or an array)
            const zodError = result.error.errors.map((err) => err.message).join(", ");
            return NextResponse.json({ error: zodError }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // prepare update data (only set password if provided)
        const updateData: Record<string, any> = { name, email };
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }

        // update user record
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { name: true, email: true },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Profile update failed:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}

// GET: Fetch user profile
export async function GET(req: NextRequest) {
    // Retrieve session using NextAuth's built-in function
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized, session missing" },
            { status: 401 }
        );
    }

    // Ensure the session contains a valid user ID
    const userId = session.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // query the database for the user profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            name: true,
            email: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
}
