import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, created_at, last_used_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ keys: data })
  } catch (error) {
    console.error("List API keys error:", error)
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 400 })
  }
}
