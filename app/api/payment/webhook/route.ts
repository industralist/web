// /app/api/payment/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { PublicKey } from "@solana/web3.js";

// Replace with your real DB / persistence
const intentStore = new Map<
  string,
  { plan: string; amount: string; user?: string }
>();

function verifyHMAC(payload: string, secret: string, signatureHeader?: string) {
  if (!signatureHeader) return false;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(signatureHeader)
  );
}

export async function POST(req: Request) {
  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  const raw = await req.text();

  if (!secret) {
    console.error("Webhook secret not configured");
    return NextResponse.json({}, { status: 500 });
  }

  const signatureHeader =
    req.headers.get("x-helius-signature") || req.headers.get("x-signature");
  if (!verifyHMAC(raw, secret, signatureHeader ?? undefined)) {
    console.warn("Webhook HMAC verification failed");
    return NextResponse.json({}, { status: 401 });
  }

  // Parse the provider payload (adjust expected shape to Helius payload)
  // Helius sends an array of events; each event can contain tx info
  const body = JSON.parse(raw);

  // Example: iterate over transactions and verify payment:
  // This is pseudo-code — confirm provider payload shape + fields
  try {
    for (const event of body) {
      // `event` shape varies by provider. Helius 'confirmed' webhook contains 'signature' and 'transaction'
      const tx = event.transaction || event; // adapt as needed
      const signature = event.signature || event.txHash || tx.signatures?.[0];

      // Extract reference(s) — depends on how you embedded reference (we used Solana Pay `reference` param,
      // which is normally added as an extra instruction with the reference pubkey.)
      // For robustness, inspect tx.message.instructions for memo data or referenced pubkeys.

      // For this template, we'll assume provider includes 'references' array
      const references =
        event.references ||
        event.references?.map((r: any) => r.toString()) ||
        [];

      for (const ref of references) {
        const saved = intentStore.get(ref);
        if (!saved) continue;

        // Validate recipient & amount: provider payload should include required info
        // Example provider field names: event.recipient, event.amount
        const recipientMatches =
          event.recipient ===
          process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION;
        const amountMatches =
          String(event.amount) === saved.amount ||
          String(event.amount) === String(parseFloat(saved.amount));

        if (recipientMatches && amountMatches) {
          // Mark user as upgraded — in production update DB
          // Save a record e.g. { reference: ref, plan: saved.plan, signature }
          console.log(
            `Payment verified for ref ${ref} plan ${saved.plan} signature ${signature}`
          );

          // Example: write to DB or call your user service to mark plan
          // DB.upsertUserPlan(saved.user, saved.plan, signature);

          // remove intent
          intentStore.delete(ref);
        } else {
          console.warn("Payment doesn't match expected values for ref", ref);
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing failed", err);
    return NextResponse.json({}, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
