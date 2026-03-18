"use client"

import { useState, useEffect, useRef } from "react"

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<string | null>
  onSignUp: (email: string, password: string, name: string) => Promise<string | null>
  onGuestBrowse: () => void
}

export function AuthScreen({ onSignIn, onSignUp, onGuestBrowse }: AuthScreenProps) {
  const [mode, setMode] = useState<"in" | "up">("in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Starfield animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const stars: { x: number; y: number; r: number; a: number; s: number }[] = []
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 0.9 + 0.1,
        a: Math.random(),
        s: Math.random() * 0.004 + 0.001,
      })
    }

    let animationId: number
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        star.a += star.s
        const al = ((Math.sin(star.a) + 1) / 2) * 0.55 + 0.05
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 228, 200, ${al})`
        ctx.fill()
      }
      animationId = requestAnimationFrame(drawStars)
    }
    drawStars()

    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleSubmit = async () => {
    setError("")
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)
    const result = mode === "in" ? await onSignIn(email, password) : await onSignUp(email, password, name)
    setLoading(false)

    if (result) {
      setError(result)
    }
  }

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-[radial-gradient(ellipse_at_50%_55%,#141630_0%,#08091a_70%)]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[400px] px-7 py-8 text-center">
        <div className="animate-[rise_0.9s_ease_0.2s_both] opacity-0 text-[0.67rem] tracking-[0.36em] uppercase text-amber mb-4">
          A shared atlas of love and loss
        </div>

        <h1 className="animate-[rise_0.9s_ease_0.4s_both] opacity-0 font-serif font-light text-[clamp(2.4rem,7vw,3.6rem)] text-star tracking-[0.07em] leading-[1.05] mb-2.5">
          Grief
          <br />
          Cartographer
        </h1>

        <p className="animate-[rise_0.9s_ease_0.6s_both] opacity-0 italic text-[0.95rem] text-muted-color leading-[1.7] mb-8">
          A living map where anyone can place the memories of someone they&apos;ve loved — visible to everyone, owned by no one.
        </p>

        <div className="animate-[rise_0.9s_ease_0.7s_both] opacity-0 flex border border-border rounded overflow-hidden mb-5">
          <button
            onClick={() => setMode("in")}
            className={`flex-1 py-2.5 font-serif text-[0.8rem] tracking-[0.15em] uppercase transition-all cursor-pointer border-none ${
              mode === "in" ? "bg-amber text-ink" : "bg-transparent text-muted-color"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("up")}
            className={`flex-1 py-2.5 font-serif text-[0.8rem] tracking-[0.15em] uppercase transition-all cursor-pointer border-none ${
              mode === "up" ? "bg-amber text-ink" : "bg-transparent text-muted-color"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="animate-[rise_0.9s_ease_0.8s_both] opacity-0 mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            className="w-full bg-[rgba(255,255,255,0.045)] border border-border rounded text-star font-sans text-base font-light py-3 px-3.5 outline-none transition-all placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
          />
        </div>

        <div className="animate-[rise_0.9s_ease_0.8s_both] opacity-0 mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            className="w-full bg-[rgba(255,255,255,0.045)] border border-border rounded text-star font-sans text-base font-light py-3 px-3.5 outline-none transition-all placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
          />
        </div>

        {mode === "up" && (
          <div className="animate-[rise_0.9s_ease_0.8s_both] opacity-0 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name (shown on memories)"
              autoComplete="name"
              className="w-full bg-[rgba(255,255,255,0.045)] border border-border rounded text-star font-sans text-base font-light py-3 px-3.5 outline-none transition-all placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="animate-[rise_0.9s_ease_0.9s_both] opacity-0 w-full py-3.5 bg-amber border-none rounded text-ink font-serif text-[0.85rem] tracking-[0.22em] uppercase cursor-pointer transition-all mt-1 hover:bg-star hover:shadow-[0_0_28px_var(--glow)] disabled:opacity-50 disabled:cursor-default"
        >
          {loading ? "..." : mode === "in" ? "Enter the atlas" : "Create account"}
        </button>

        <div className="animate-[rise_0.9s_ease_0.95s_both] opacity-0 min-h-[20px] text-[0.82rem] text-danger mt-2.5">
          {error}
        </div>

        <button
          onClick={onGuestBrowse}
          className="animate-[rise_0.9s_ease_1s_both] opacity-0 text-[0.75rem] text-muted-color mt-4 cursor-pointer tracking-[0.06em] underline underline-offset-[3px] hover:text-text bg-transparent border-none"
        >
          Browse the map without an account
        </button>
      </div>

      <style jsx>{`
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(13px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
