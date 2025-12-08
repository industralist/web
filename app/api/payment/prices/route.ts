import { NextResponse } from "next/server"
import { getDynamicPlanPrices } from "@/lib/sol-price"

export async function GET() {
  try {
    const prices = await getDynamicPlanPrices()
    return NextResponse.json({ prices })
  } catch (error: any) {
    console.error("[v0] Error fetching prices:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
