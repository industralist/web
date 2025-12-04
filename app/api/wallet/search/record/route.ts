import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { userId, walletAddress } = await req.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Check if search exists
    const { data: existing } = await supabase
      .from("wallet_searches")
      .select("id, search_count")
      .eq("wallet_address", walletAddress)
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      // Update search count
      await supabase
        .from("wallet_searches")
        .update({
          search_count: existing.search_count + 1,
          last_searched: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      // Create new search record
      await supabase.from("wallet_searches").insert({
        user_id: userId,
        wallet_address: walletAddress,
        search_count: 1,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Search record error:", error)
    return NextResponse.json({ error: "Failed to record search" }, { status: 400 })
  }
}
