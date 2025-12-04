"use client"

export function AnimatedLine() {
  return (
    <div className="fixed top-32 md:top-40 left-0 right-0 h-1 overflow-hidden z-40 pointer-events-none">
      <div
        className="h-full w-full"
        style={{
          background: "linear-gradient(90deg, transparent, #ff6b3b, #ff8557, #ff6b3b, transparent)",
          boxShadow: "0 0 20px rgba(255, 107, 59, 0.6)",
          animation: "lineFlow 3s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes lineFlow {
          0% {
            opacity: 0;
            transform: scaleX(0.3);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(0.3);
          }
        }
      `}</style>
    </div>
  )
}
