import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

import couchDb from "@/lib/db/couchdb";
import redisClient from "@/lib/db/redis";
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

    // 1. Fetch User from Central Database
    const coreDb = couchDb.use("techaxon_core");
    const query = await coreDb.find({
      selector: { type: "user", username: username },
    });
    const user = query.docs[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 2. Verify Password
    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // 3. Generate JWT Tokens
    const accessToken = await signAccessToken({
      userId: user._id,
      username: user.username,
    });
    const refreshToken = await signRefreshToken({ userId: user._id });

    // 4. Hash Refresh Token & Create Session
    const hashedRefreshToken = await hashValue(refreshToken);
    const sessionId = crypto.randomUUID();

    const sessionData = {
      _id: sessionId,
      type: "session",
      userId: user._id,
      hashedRefreshToken,
      deviceInfo: deviceInfo || "Unknown Device",
      userAgent: request.headers.get("user-agent") || "Unknown",
      ip: request.headers.get("x-forwarded-for") || "Unknown",
      createdAt: new Date().toISOString(),
      isValid: true,
    };

    // 5. Save Session to CouchDB & Redis
    await coreDb.insert(sessionData);

    const REDIS_SESSION_TTL = 7 * 24 * 60 * 60; // 7 Days
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      REDIS_SESSION_TTL,
    );

    // 6. Set SSO Cookie
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
