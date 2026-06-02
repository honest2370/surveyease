// src/lib/hmac.ts
// SHA-256 HMAC signature validation for RapidoReach postback security

import crypto from "crypto";

/**
 * Verifies the HMAC-SHA256 signature from RapidoReach
 * RapidoReach signs: userId + transId + reward + status
 * using your App Secret as the HMAC key
 */
export function verifyRapidoReachSignature(params: {
  userId: string;
  transId: string;
  reward: string;
  status: string;
  signature: string;
}): boolean {
  const secret = process.env.SURVEY_SECRET_KEY;

  if (!secret) {
    console.error("[HMAC] SURVEY_SECRET_KEY environment variable is not set");
    return false;
  }

  // Build the raw string that RapidoReach signs
  // Format: userId:transId:reward:status
  const rawString = `${params.userId}:${params.transId}:${params.reward}:${params.status}`;

  // Compute our expected HMAC
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawString)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(params.signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    // Buffer lengths differ = signature mismatch
    return false;
  }
}

/**
 * Generates a test signature for development/simulation purposes
 * Only used by the dev test panel endpoint
 */
export function generateTestSignature(params: {
  userId: string;
  transId: string;
  reward: string;
  status: string;
}): string {
  const secret = process.env.SURVEY_SECRET_KEY || "b95892f5497255ca5edaad340fee54ff";
  const rawString = `${params.userId}:${params.transId}:${params.reward}:${params.status}`;
  return crypto.createHmac("sha256", secret).update(rawString).digest("hex");
}
