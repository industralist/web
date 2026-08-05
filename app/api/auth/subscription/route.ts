import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const rawUserId =
      req.headers.get("x-user-id") ||
      req.headers.get("user-id") ||
      req.headers.get("x-wallet-address") ||
      req.nextUrl.searchParams.get("userId") || ""

    if (!rawUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const cleanWallet = rawUserId.replace(/^usr_/, "")

    try {
      const supabase = await getSupabaseServer()

      const { data: dbUsers } = await supabase
        .from("users")
        .select("id, wallet_address")

      let matchedUserId = rawUserId
      if (dbUsers && dbUsers.length > 0) {
        const found = dbUsers.find(
          (u) =>
            u.id === rawUserId ||
            u.wallet_address === rawUserId ||
            u.wallet_address === cleanWallet ||
            (cleanWallet && u.wallet_address?.includes(cleanWallet)) ||
            (cleanWallet && u.id?.includes(cleanWallet))
        )
        if (found) {
          matchedUserId = found.id
        }
      }

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .order("updated_at", { ascending: false })

      if (subscriptions && subscriptions.length > 0) {
        const sub = subscriptions.find(
          (s) =>
            s.user_id === matchedUserId ||
            s.user_id === rawUserId ||
            s.user_id === cleanWallet ||
            (cleanWallet && s.user_id?.includes(cleanWallet))
        )
        if (sub) {
          return NextResponse.json({ subscription: sub })
        }
      }
    } catch (dbError) {
      console.error("Database error in subscription GET:", dbError)
    }

    // Default fallback free subscription if DB query fails or returns nothing
    return NextResponse.json({
      subscription: {
        id: `sub_${rawUserId}`,
        user_id: rawUserId,
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
