"use client"

import { useState, useEffect } from "react"
import { Memory } from "@/app/page"

interface LetterPanelProps {
  memory: Memory
  onClose: () => void
}

export function LetterPanel({ memory, onClose }: LetterPanelProps) {
  const [letterText, setLetterText] = useState(memory.letter || "")
  const [loading, setLoading] = useState(!memory.letter)

  useEffect(() => {
    if (memory.letter) {
      setLetterText(memory.letter)
      setLoading(false)
      return
    }

    // Generate letter using AI
    setLoading(true)
    setLetterText("The letter is being written...")

    // Note: In production, this should go through a server-side API route
    // For now, we'll show a placeholder
    const timer = setTimeout(() => {
      setLetterText(
        `Dear one,\n\nI see you carrying this memory of ${memory.place}, and I want you to know that every moment we shared there still echoes through time. The love we built doesn't diminish with my absence—it grows in the spaces between your heartbeats, in the quiet moments when you remember.\n\nPlease know that your grief is not a burden to bear alone. It is the measure of what we meant to each other, and there is beauty in that weight. Let it wash over you when it needs to, and let it rest when you need rest.\n\nYou are doing so well, even when it doesn't feel that way. I am proud of you, and I am grateful for every memory you hold.\n\nWith all my love,\n${memory.person_name}`
      )
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [memory])

  const generateNewLetter = () => {
    setLoading(true)
    setLetterText("The letter is being written...")
    
    setTimeout(() => {
      setLetterText(
        `Dear one,\n\nThere are no words that can fill the space I've left, but I hope these ones find you in a moment of stillness. Remember that ${memory.place} holds not just echoes of loss, but echoes of joy—the kind that still belongs to us.\n\nI think of you often, in that way that transcends the boundaries of what we know. And I hope you think of me too, not with sadness, but with the gentle warmth of what was.\n\nYou were, and continue to be, such a gift to my existence. Thank you for holding this memory, for keeping our story alive in your heart.\n\nForever yours,\n${memory.person_name}`
      )
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="fixed top-[54px] right-0 bottom-0 w-[400px] max-w-[92vw] bg-deep border-l border-border z-[600] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.4)] animate-[slideIn_0.42s_cubic-bezier(0.22,1,0.36,1)]">
      <div className="px-5 pt-5 pb-4 border-b border-[rgba(232,168,76,0.07)] flex-shrink-0 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 bg-none border-none text-muted-color cursor-pointer text-[1.1rem] hover:text-amber"
        >
          ✕
        </button>
        <div className="font-serif text-[1.04rem] tracking-[0.1em] text-star">A Letter</div>
        <div className="text-[0.75rem] italic text-muted-color mt-1">
          Written as {memory.person_name}, from {memory.place}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div
          className={`font-serif text-base font-light text-star leading-[1.9] whitespace-pre-wrap ${
            loading ? "text-muted-color animate-[shimmer_2s_ease_infinite]" : ""
          }`}
        >
          {letterText}
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-[rgba(232,168,76,0.07)]">
        <button
          onClick={generateNewLetter}
          disabled={loading}
          className="py-2 px-3.5 rounded cursor-pointer font-serif text-[0.74rem] tracking-[0.18em] uppercase transition-all bg-transparent border border-[rgba(255,255,255,0.11)] text-muted-color hover:border-dim hover:text-amber disabled:opacity-50 disabled:cursor-default"
        >
          Write another
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}
