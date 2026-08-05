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

      let targetUserId = userId
      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .or(`id.eq.${userId},wallet_address.eq.${userId}`)
          .maybeSingle()

        if (dbUser) {
          targetUserId = dbUser.id
        }
      } catch (uErr) {
        console.error("User lookup warning in GET subscription:", uErr)
      }

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .or(`user_id.eq.${targetUserId},user_id.eq.${userId}`)
        .order("updated_at", { ascending: false })
        .limit(1)

      const subscription = subscriptions?.[0]

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
