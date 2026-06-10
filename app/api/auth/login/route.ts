import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

import couchDb from "@/lib/db/couchdb";
import redisClient from "@/lib/db/redis";
// Using YOUR exact function names for password and JWT!
import { compareValue, hashValue } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, deviceInfo } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const usersDb = couchDb.use("users");
    const query = await usersDb.find({ selector: { username } });
    const user = query.docs[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Using your compareValue function
    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Using your sign tokens functions
    const accessToken = await signAccessToken({
      userId: user._id,
      username: user.username,
    });
    const refreshToken = await signRefreshToken({ userId: user._id });

    // Using your hashValue function
    const hashedRefreshToken = await hashValue(refreshToken);

    const sessionId = crypto.randomUUID();
    const sessionData = {
      _id: sessionId,
      userId: user._id,
      hashedRefreshToken,
      deviceInfo: deviceInfo || "Unknown Device",
      userAgent: request.headers.get("user-agent") || "Unknown",
      ip: request.headers.get("x-forwarded-for") || "Unknown",
      createdAt: new Date().toISOString(),
      isValid: true,
      type: "session",
    };

    const sessionsDb = couchDb.use("sessions");
    await sessionsDb.insert(sessionData);

    const REDIS_SESSION_TTL = 7 * 24 * 60 * 60;
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      REDIS_SESSION_TTL,
    );

    const cookieStore = await cookies();
    cookieStore.set("techaxon_refresh_token", `${sessionId}:${refreshToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
      maxAge: REDIS_SESSION_TTL,
    });

    return NextResponse.json({
      success: true,
      accessToken,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
