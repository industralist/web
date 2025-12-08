import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Recording payment in database")

    const { userId, planType, tokenType, tokenAmount, amountUsd, transactionHash } = await req.json()
    console.log("[v0] Payment data:", { userId, planType, tokenType, tokenAmount, amountUsd, transactionHash })

    if (!userId || !transactionHash) {
      console.error("[v0] Missing required payment fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    console.log("[v0] Supabase server initialized")

    const { data: existingPayment, error: dupError } = await supabase
      .from("payments")
      .select("id, status, subscription_id")
      .eq("transaction_hash", transactionHash)
      .eq("user_id", userId)
      .maybeSingle()

    if (existingPayment) {
      console.log("[v0] Payment already recorded for transaction:", transactionHash)
      return NextResponse.json({
        success: true,
        message: "Payment already recorded",
        payment: existingPayment,
      })
    }

    console.log("[v0] Creating/updating subscription for user:", userId)

    const renewalPeriodMs = planType === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000

    const { data: existingSub, error: queryError } = await supabase
      .from("subscriptions")
      .select("id, next_billing_date, status")
      .eq("user_id", userId)
      .maybeSingle()

    if (queryError) {
      console.error("[v0] Query error:", queryError)
      throw new Error(`Subscription query failed: ${queryError.message}`)
    }

    let subscription
    if (existingSub) {
      const currentExpiration = new Date(existingSub.next_billing_date)
      const newExpiration = new Date(currentExpiration.getTime() + renewalPeriodMs)

      console.log("[v0] Extending subscription from", currentExpiration, "to", newExpiration)

      // Update existing subscription
      const { data: updated, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_type: planType === "yearly" ? "yearly" : "monthly",
          billing_cycle: planType === "yearly" ? "yearly" : "monthly",
          status: "active",
          price_usd: amountUsd,
          next_billing_date: newExpiration.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Subscription update error:", updateError)
        throw new Error(`Subscription update failed: ${updateError.message}`)
      }
      subscription = updated
    } else {
      const newExpiration = new Date(Date.now() + renewalPeriodMs)
      console.log("[v0] Creating new subscription expiring on", newExpiration)

      // Insert new subscription
      const { data: inserted, error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_type: planType === "yearly" ? "yearly" : "monthly",
          billing_cycle: planType === "yearly" ? "yearly" : "monthly",
          status: "active",
          price_usd: amountUsd,
          next_billing_date: newExpiration.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Subscription insert error:", insertError)
        throw new Error(`Subscription insert failed: ${insertError.message}`)
      }
      subscription = inserted
    }

    console.log("[v0] Subscription created/updated:", subscription?.id)

    console.log("[v0] Recording payment transaction")
    const paymentDate = new Date()
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
        payment_date: paymentDate.toISOString(),
        created_at: paymentDate.toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error("[v0] Payment insert error:", paymentError)
      throw new Error(`Payment insert failed: ${paymentError.message}`)
    }

    console.log("[v0] Payment recorded successfully:", payment?.id)
    return NextResponse.json({ success: true, subscription, payment })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)
    console.error("[v0] Error message:", error.message)
    return NextResponse.json({ error: error.message || "Payment creation failed" }, { status: 500 })
  }
}
