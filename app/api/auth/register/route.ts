import { NextResponse } from "next/server";
import couchDb from "@/lib/db/couchdb";
import { hashValue } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const usersDb = couchDb.use("users");

    // Using your exact function name:
    const hashedPassword = await hashValue(password);

    const newUser = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      type: "user",
    };

    const response = await usersDb.insert(newUser);
    return NextResponse.json({
      success: true,
      message: `User ${username} created!`,
      id: response.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
