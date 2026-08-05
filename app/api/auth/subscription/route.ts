import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId =
      req.headers.get("x-user-id") ||
      req.headers.get("user-id") ||
      req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    try {
      const supabase = await getSupabaseServer()

      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

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

      if (subscription) {
        return NextResponse.json({ subscription })
      }
    } catch (dbError) {
      console.error("Database error in subscription GET:", dbError)
    }

    // Default fallback free subscription if DB query fails or returns nothing
    return NextResponse.json({
      subscription: {
        id: `sub_${userId}`,
        user_id: userId,
        plan_type: "free",
        status: "active",
        price_usd: 0,
        billing_cycle: "monthly",
      },
    })
  } catch (error: any) {
    console.error("Get subscription error:", error)
    return NextResponse.json({ error: error.message || "Failed to get subscription" }, { status: 500 })
  }
}
