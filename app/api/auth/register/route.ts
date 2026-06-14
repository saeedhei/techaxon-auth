import { NextResponse } from "next/server";
import couchDb from "@/lib/db/couchdb";
import { hashValue } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // 1. Connect to the Central Database
    const coreDb = couchDb.use("techaxon_core");

    // 2. Hash the password securely
    const hashedPassword = await hashValue(password);

    // 3. Create the user document (Single-Table Design)
    const newUser = {
      type: "user",
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to CouchDB
    const response = await coreDb.insert(newUser);

    return NextResponse.json({
      success: true,
      message: `User ${username} created successfully!`,
      id: response.id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
