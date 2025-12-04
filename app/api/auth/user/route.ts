import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, wallet_address, email, is_verified, created_at")
      .eq("id", userId)
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, email } = await req.json()

    const supabase = await getSupabaseServer()

    const { data: user, error } = await supabase
      .from("users")
      .update({ email, updated_at: new Date() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 400 })
  }
}
