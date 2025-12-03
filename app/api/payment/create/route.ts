// /app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import { Keypair, PublicKey } from "@solana/web3.js";
import { encodeURL } from "@solana/pay"; // install @solana/pay
import BigNumber from "bignumber.js";

type Body = {
  plan: "Pro" | "Pro+";
  userPublicKey?: string; // optional
};

const PAYMENT_DEST = process.env.NEXT_PUBLIC_SOLANA_PAYMENT_DESTINATION!;
const LABEL =
  process.env.NEXT_PUBLIC_SOLANA_PAYMENT_LABEL || "Piflepath Subscription";

// In-memory map for example purposes (replace with DB)
const intentStore = new Map<
  string,
  { plan: string; amount: string; user?: string }
>();

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();

    if (!body.plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const amountSOL = body.plan === "Pro" ? "0.1" : "0.2"; // set correct amounts or compute from USDT
    const recipient = new PublicKey(PAYMENT_DEST);

    // Create unique reference keypair; we will ask payer to include this in Memo
    const reference = Keypair.generate().publicKey;

    // Build Solana Pay URL including reference (encoded)
    const url = encodeURL({
      recipient,
      amount: new BigNumber(amountSOL),
      label: LABEL,
      reference,
    });

    // persist the intent server-side so webhook can verify later
    intentStore.set(reference.toBase58(), {
      plan: body.plan,
      amount: amountSOL,
      user: body.userPublicKey,
    });

    return NextResponse.json({
      url: url.toString(),
      reference: reference.toBase58(),
      amount: amountSOL,
      recipient: recipient.toBase58(),
    });
  } catch (err) {
    console.error("create intent error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
