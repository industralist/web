import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const walletAddress = body.walletAddress || body.publicKey || body.address

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Valid wallet address is required" }, { status: 400 })
    }

    try {
      const supabase = await getSupabaseServer()

      // Check if user exists
      const { data: existingUser, error: queryError } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", walletAddress)
        .maybeSingle()

      if (queryError) {
        console.error("Supabase wallet query error:", queryError)
      } else if (existingUser) {
        return NextResponse.json({ userId: existingUser.id, isNew: false })
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            wallet_address: walletAddress,
          })
          .select()
          .single()

        if (insertError) {
          console.error("Supabase wallet insert error:", insertError)
        } else if (newUser) {
          // Create free subscription asynchronously
          await supabase.from("subscriptions").insert({
            user_id: newUser.id,
            plan_type: "free",
            status: "active",
          }).catch(err => console.error("Free subscription insert error:", err))

          return NextResponse.json({ userId: newUser.id, isNew: true })
        }
      }
    } catch (dbError) {
      console.error("Database connection / Supabase error in verify-wallet:", dbError)
    }

    // Fallback: If Supabase table is unavailable or missing env vars, generate fallback user ID
    // so wallet login succeeds on the client side without throwing 400 Bad Request
    const fallbackUserId = `usr_${walletAddress.slice(0, 10)}`
    return NextResponse.json({ userId: fallbackUserId, isNew: false, fallback: true })

  } catch (error: any) {
    console.error("Wallet verification endpoint error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
