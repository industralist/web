"use client"

import { useEffect, useRef } from "react"

export function RotatingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 300

    let rotation = 0

    const drawGlobe = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 80

      // Draw rotating grid
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation)

      // Draw latitude lines (horizontal)
      ctx.strokeStyle = "rgba(255, 107, 59, 0.2)"
      ctx.lineWidth = 1
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath()
        ctx.ellipse(0, (i * radius) / 3, radius, radius / 4, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw longitude lines (vertical)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(angle) * radius, -radius)
        ctx.lineTo(Math.cos(angle) * radius, radius)
        ctx.stroke()
      }

      // Draw dotted pattern
      ctx.fillStyle = "rgba(255, 107, 59, 0.4)"
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * radius
        const x = Math.cos(angle) * dist
        const y = Math.sin(angle) * dist * 0.5
        ctx.fillRect(x - 1, y - 1, 2, 2)
      }

      ctx.restore()

      // Draw outer ring glow
      ctx.strokeStyle = "rgba(255, 107, 59, 0.6)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      rotation += 0.005

      requestAnimationFrame(drawGlobe)
    }

    drawGlobe()

    return () => {
      // Cleanup if needed
    }
  }, [])

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 opacity-40 md:opacity-50 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90"
        style={{ filter: "drop-shadow(0 0 40px rgba(255, 107, 59, 0.3))" }}
      />
    </div>
  )
}
