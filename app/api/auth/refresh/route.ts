import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import couchDb from "@/lib/db/couchdb";
import redisClient from "@/lib/db/redis";
import { compareValue, hashValue } from "@/lib/auth/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    // 1. Get the SSO Cookie
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("techaxon_refresh_token")?.value;

    if (!cookieValue) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 401 },
      );
    }

    // 2. Extract Session ID and Raw Refresh Token
    const [sessionId, rawRefreshToken] = cookieValue.split(":");

    if (!sessionId || !rawRefreshToken) {
      return NextResponse.json(
        { error: "Invalid cookie format" },
        { status: 401 },
      );
    }

    // 3. Verify JWT signature & expiration
    let payload;
    try {
      payload = await verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      return NextResponse.json(
        { error: "Refresh token expired or invalid" },
        { status: 401 },
      );
    }

    // 4. Look up the Session (Try Redis first for speed)
    let sessionData;
    const cachedSession = await redisClient.get(`session:${sessionId}`);

    if (cachedSession) {
      sessionData = JSON.parse(cachedSession);
    } else {
      // Fallback to CouchDB if Redis evicted it
      const coreDb = couchDb.use("techaxon_core");
      try {
        sessionData = await coreDb.get(sessionId);
      } catch (err) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 401 },
        );
      }
    }

    // 5. Check if session is explicitly revoked
    if (!sessionData || !sessionData.isValid) {
      return NextResponse.json({ error: "Session revoked" }, { status: 401 });
    }

    // 6. Security Check: Does the token match the hash in the database?
    const isTokenValid = await compareValue(
      rawRefreshToken,
      sessionData.hashedRefreshToken,
    );

    if (!isTokenValid) {
      // 🚨 COMPROMISED SESSION DETECTED 🚨
      // Someone used an old refresh token. Revoke the session immediately!
      const coreDb = couchDb.use("techaxon_core");
      await coreDb.insert({ ...sessionData, isValid: false });
      await redisClient.del(`session:${sessionId}`);

      return NextResponse.json(
        { error: "Security breach detected. Session revoked." },
        { status: 403 },
      );
    }

    // 7. Token Rotation: Generate Brand New Tokens
    const newAccessToken = await signAccessToken({
      userId: sessionData.userId,
      username: payload.username,
    });
    const newRefreshToken = await signRefreshToken({
      userId: sessionData.userId,
    });

    // 8. Hash the new refresh token
    const newHashedRefreshToken = await hashValue(newRefreshToken);

    // 9. Update Session in CouchDB (Using the old _rev to prevent conflicts)
    const updatedSession = {
      ...sessionData,
      hashedRefreshToken: newHashedRefreshToken,
      updatedAt: new Date().toISOString(),
    };

    const coreDb = couchDb.use("techaxon_core");
    const response = await coreDb.insert(updatedSession);

    // 10. Update the session with the NEW CouchDB revision ID
    updatedSession._rev = response.rev;

    // 11. Save the newly rotated session to Redis
    const REDIS_SESSION_TTL = 7 * 24 * 60 * 60; // 7 days
    await redisClient.set(
      `session:${sessionId}`,
      JSON.stringify(updatedSession),
      "EX",
      REDIS_SESSION_TTL,
    );

    // 12. Set the New SSO Cookie
    cookieStore.set(
      "techaxon_refresh_token",
      `${sessionId}:${newRefreshToken}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.COOKIE_DOMAIN,
        path: "/",
        maxAge: REDIS_SESSION_TTL,
      },
    );

    // 13. Return the new Access Token
    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
