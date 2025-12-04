import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code === "PGRST116") {
      // No subscription found, create free one
      const { data: newSub } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_type: "free",
          status: "active",
        })
        .select()
        .single()

      return NextResponse.json({ subscription: newSub })
    }

    if (error) throw error

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json({ error: "Failed to get subscription" }, { status: 400 })
  }
}
