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

      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, created_at, last_used_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (data) {
        return NextResponse.json({ keys: data })
      }
    } catch (dbError) {
      console.error("Database error in list API keys:", dbError)
    }

    // Fallback to empty keys array if DB query fails or returns null
    return NextResponse.json({ keys: [] })
  } catch (error: any) {
    console.error("List API keys error:", error)
    return NextResponse.json({ error: error.message || "Failed to list API keys" }, { status: 500 })
  }
}
