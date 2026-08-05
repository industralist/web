import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Recording payment in database")

    const { userId, planName, planType, billingPeriod, tokenType, tokenAmount, amountUsd, transactionHash } = await req.json()
    console.log("[v0] Payment data:", { userId, planName, planType, billingPeriod, tokenType, tokenAmount, amountUsd, transactionHash })

    if (!userId || !transactionHash) {
      console.error("[v0] Missing required payment fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const finalPlanType = (planName || planType || "pro").toLowerCase()
    const cycle = billingPeriod || (planType === "yearly" ? "yearly" : "monthly")
    const renewalPeriodMs = cycle === "yearly" ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000

    const supabase = await getSupabaseServer()
    console.log("[v0] Supabase server initialized")

    let targetUserId = userId
    try {
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .or(`id.eq.${userId},wallet_address.eq.${userId}`)
        .maybeSingle()

      if (dbUser) {
        targetUserId = dbUser.id
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ wallet_address: userId })
          .select("id")
          .single()
        if (newUser) {
          targetUserId = newUser.id
        }
      }
    } catch (userErr) {
      console.error("[v0] User lookup/creation warning:", userErr)
    }

    console.log("[v0] Using targetUserId for payment & subscription:", targetUserId)

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status, subscription_id")
      .eq("transaction_hash", transactionHash)
      .maybeSingle()

    if (existingPayment) {
      console.log("[v0] Payment already recorded for transaction:", transactionHash)
      return NextResponse.json({
        success: true,
        message: "Payment already recorded",
        payment: existingPayment,
      })
    }

    console.log("[v0] Creating/updating subscription for user:", targetUserId)

    const { data: existingSubs } = await supabase
      .from("subscriptions")
      .select("id, next_billing_date, status")
      .or(`user_id.eq.${targetUserId},user_id.eq.${userId}`)
      .order("updated_at", { ascending: false })
      .limit(1)

    const existingSub = existingSubs?.[0]

    let subscription
    if (existingSub) {
      const currentExpiration = new Date(existingSub.next_billing_date || Date.now())
      const newExpiration = new Date(currentExpiration.getTime() + renewalPeriodMs)

      console.log("[v0] Extending subscription from", currentExpiration, "to", newExpiration)

      const { data: updated, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_type: finalPlanType,
          billing_cycle: cycle,
          status: "active",
          price_usd: amountUsd,
          next_billing_date: newExpiration.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSub.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Subscription update error:", updateError)
      }
      subscription = updated || existingSub
    } else {
      const newExpiration = new Date(Date.now() + renewalPeriodMs)
      console.log("[v0] Creating new subscription expiring on", newExpiration)

      const { data: inserted, error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: targetUserId,
          plan_type: finalPlanType,
          billing_cycle: cycle,
          status: "active",
          price_usd: amountUsd,
          next_billing_date: newExpiration.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Subscription insert error:", insertError)
      }
      subscription = inserted
    }

    console.log("[v0] Subscription created/updated:", subscription?.id)

    console.log("[v0] Recording payment transaction")
    const paymentDate = new Date()
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: targetUserId,
        subscription_id: subscription?.id || `sub_${targetUserId}`,
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
    }

    console.log("[v0] Payment recorded successfully:", payment?.id)
    return NextResponse.json({
      success: true,
      subscription: subscription || {
        id: `sub_${targetUserId}`,
        user_id: targetUserId,
        plan_type: finalPlanType,
        status: "active",
        price_usd: amountUsd,
        billing_cycle: cycle,
      },
      payment: payment || null,
    })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)
    console.error("[v0] Error message:", error.message)
    return NextResponse.json({ error: error.message || "Payment creation failed" }, { status: 500 })
  }
}
