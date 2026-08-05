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

      const { data: user, error } = await supabase
        .from("users")
        .select("id, wallet_address, email, is_verified, created_at")
        .eq("id", userId)
        .maybeSingle()

      if (user) {
        return NextResponse.json({ user })
      }
    } catch (dbError) {
      console.error("Database error in get user:", dbError)
    }

    return NextResponse.json({
      user: {
        id: userId,
        wallet_address: "",
        email: null,
        is_verified: false,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: error.message || "Failed to get user" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, email } = await req.json().catch(() => ({}))

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    try {
      const supabase = await getSupabaseServer()

      const { data: user, error } = await supabase
        .from("users")
        .update({ email, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .maybeSingle()

      if (user) {
        return NextResponse.json({ user })
      }
    } catch (dbError) {
      console.error("Database error in update user:", dbError)
    }

    return NextResponse.json({
      user: { id: userId, email, updated_at: new Date().toISOString() },
    })
  } catch (error: any) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 })
  }
}
