import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { userId, name } = await req.json()

    // Generate API key
    const apiKey = crypto.randomBytes(32).toString("hex")
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")

    const supabase = await getSupabaseServer()

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        name,
        key_hash: keyHash,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      apiKey,
      keyId: data.id,
      name: data.name,
    })
  } catch (error) {
    console.error("API key creation error:", error)
    return NextResponse.json({ error: "API key creation failed" }, { status: 400 })
  }
}
