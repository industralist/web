import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(req: NextRequest) {
  try {
    const { keyId, userId } = await req.json()

    const supabase = await getSupabaseServer()

    const { error } = await supabase.from("api_keys").delete().eq("id", keyId).eq("user_id", userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete API key error:", error)
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 400 })
  }
}
