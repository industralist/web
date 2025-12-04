import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { userId, planType, tokenType, tokenAmount, amountUsd, transactionHash } = await req.json()

    const supabase = await getSupabaseServer()

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_type: planType,
        billing_cycle: planType === "yearly" ? "yearly" : "monthly",
        status: "active",
        price_usd: amountUsd,
        next_billing_date: new Date(
          Date.now() + (planType === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000),
        ),
      })
      .select()
      .single()

    if (subError) throw subError

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        amount_usd: amountUsd,
        token_type: tokenType,
        token_amount: tokenAmount,
        transaction_hash: transactionHash,
        status: "completed",
        payment_date: new Date(),
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    return NextResponse.json({ success: true, subscription, payment })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Payment creation failed" }, { status: 400 })
  }
}
