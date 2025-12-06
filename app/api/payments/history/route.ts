import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false })
      .limit(50)

    if (error) {
      console.error("[v0] Payment history error:", error)
      return NextResponse.json({ error: "Failed to fetch payment history" }, { status: 500 })
    }

    return NextResponse.json({ payments })
  } catch (error: any) {
    console.error("[v0] History error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
