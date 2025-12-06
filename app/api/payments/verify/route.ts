import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const transactionHash = req.nextUrl.searchParams.get("hash")
    const userId = req.nextUrl.searchParams.get("userId")

    if (!transactionHash || !userId) {
      return NextResponse.json({ error: "Missing transaction hash or user ID" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Check if payment exists in database
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*, subscriptions(plan_type, status)")
      .eq("transaction_hash", transactionHash)
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      console.error("[v0] Payment lookup error:", error)
      return NextResponse.json({ error: "Failed to lookup payment" }, { status: 500 })
    }

    if (!payment) {
      return NextResponse.json({
        status: "pending",
        message: "Payment not yet recorded in database",
      })
    }

    return NextResponse.json({
      status: "confirmed",
      payment,
      subscription: payment.subscriptions,
    })
  } catch (error: any) {
    console.error("[v0] Verification error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
