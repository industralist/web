import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()

    const supabase = await getSupabaseServer()

    // Check if user exists
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .maybeSingle()

    if (queryError) throw queryError

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          wallet_address: walletAddress,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Create free subscription
      await supabase.from("subscriptions").insert({
        user_id: newUser.id,
        plan_type: "free",
        status: "active",
      })

      return NextResponse.json({ userId: newUser.id, isNew: true })
    }

    return NextResponse.json({ userId: existingUser.id, isNew: false })
  } catch (error) {
    console.error("Wallet verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 400 })
  }
}
