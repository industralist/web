"use client"

import { useEffect, useRef, useState } from "react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function SolChart() {
  const [data, setData] = useState<
    Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }>
  >([])
  const [loading, setLoading] = useState(true)
  const [priceChange, setPriceChange] = useState(0)
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateCandleData = (basePrice: number) => {
    const now = new Date()
    const dataPoints = []

    // Generate 30 candlesticks for realistic candlestick chart (like Jupiter Mobile)
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000 * 60 * 48) // ~24 hours / 30 candles
      const variance = (Math.random() - 0.5) * 8
      const trend = (29 - i) * 0.08
      const baseValue = basePrice + variance + trend

      const open = baseValue + (Math.random() - 0.5) * 3
      const close = baseValue + (Math.random() - 0.5) * 3
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2
      const volume = Math.floor(Math.random() * 1000000)

      dataPoints.push({
        time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        open: Number.parseFloat(Math.max(140, Math.min(160, open)).toFixed(2)),
        high: Number.parseFloat(Math.max(140, Math.min(162, high)).toFixed(2)),
        low: Number.parseFloat(Math.max(138, Math.min(160, low)).toFixed(2)),
        close: Number.parseFloat(Math.max(140, Math.min(160, close)).toFixed(2)),
        volume,
      })
    }

    return dataPoints
  }

  const fetchSolPrice = async () => {
    try {
      const response = await fetch("/api/trending-tokens")
      const result = await response.json()

      if (result.success && result.data) {
        const solToken = result.data.find((t: any) => t.symbol === "SOL")
        if (solToken) {
          const basePrice = Number.parseFloat(solToken.price)
          const chartData = generateCandleData(basePrice)
          setData(chartData)

          // Calculate price change (last close vs first open)
          const change = chartData[chartData.length - 1].close - chartData[0].open
          setPriceChange(change)
        }
      }
    } catch (error) {
      console.error("Error fetching SOL price:", error)
      const defaultData = generateCandleData(150)
      setData(defaultData)
      setPriceChange(defaultData[defaultData.length - 1].close - defaultData[0].open)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolPrice()
    fetchIntervalRef.current = setInterval(fetchSolPrice, 10000)

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b3b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff6b3b" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,107,59,0.1)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#a1a1a1" }} stroke="#666" interval={4} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a1a1a1" }} stroke="#666" width={50} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "#a1a1a1" }}
            stroke="#666"
            width={50}
          />

          {/* Volume bars in background */}
          <Bar
            yAxisId="right"
            dataKey="volume"
            fill="url(#volumeGradient)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />

          {/* Candlestick custom shape */}
          {data.map((item, index) => {
            const isGain = item.close >= item.open
            const color = isGain ? "#10b981" : "#ef4444"
            const bodyTop = Math.max(item.open, item.close)
            const bodyBottom = Math.min(item.open, item.close)
            const bodyHeight = bodyTop - bodyBottom

            return (
              <line
                key={`wick-${index}`}
                x1={`${(index / data.length) * 100}%`}
                y1={`${((item.high - 138) / 24) * 100}%`}
                x2={`${(index / data.length) * 100}%`}
                y2={`${((item.low - 138) / 24) * 100}%`}
                stroke={color}
                strokeWidth={1}
              />
            )
          })}

          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #ff6b3b",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ color: "#fff" }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload
                return (
                  <div className="text-xs space-y-1">
                    <p className="text-gray-400">Open: ${data.open}</p>
                    <p className="text-green-500">High: ${data.high}</p>
                    <p className="text-red-500">Low: ${data.low}</p>
                    <p className={data.close >= data.open ? "text-green-500" : "text-red-500"}>Close: ${data.close}</p>
                  </div>
                )
              }
              return null
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="close"
            stroke="#ff6b3b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            opacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <div className={`text-sm font-medium ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
          {priceChange >= 0 ? "↑" : "↓"} {Math.abs(priceChange).toFixed(2)} ({((priceChange / 150) * 100).toFixed(2)}%)
        </div>
      </div>
    </div>
  )
}
