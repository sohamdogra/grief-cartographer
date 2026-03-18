"use client"

import { useState } from "react"
import { Memory, CurrentUser } from "@/app/page"

interface TimelineViewProps {
  memories: Memory[]
  currentUser: CurrentUser | null
  onViewMemory: (memory: Memory) => void
}

export function TimelineView({ memories, currentUser, onViewMemory }: TimelineViewProps) {
  const [filter, setFilter] = useState<"all" | "mine">("all")

  const filteredMemories =
    filter === "mine" && currentUser ? memories.filter((m) => m.user_id === currentUser.id) : memories

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="fixed inset-0 top-[54px] overflow-y-auto bg-ink">
      <div className="max-w-[700px] mx-auto px-5 py-12 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-[1.8rem] font-light text-star">The Shared Atlas</h2>
          <p className="italic text-muted-color mt-2">
            {filteredMemories.length} {filteredMemories.length === 1 ? "memory" : "memories"} in the atlas
          </p>
        </div>

        <div className="flex gap-2.5 justify-center mb-10 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`bg-transparent border border-border text-muted-color py-1.5 px-4 rounded-full cursor-pointer font-serif text-[0.76rem] tracking-[0.14em] uppercase transition-all ${
              filter === "all" ? "bg-amber border-amber text-ink" : ""
            }`}
          >
            All memories
          </button>
          <button
            onClick={() => setFilter("mine")}
            className={`bg-transparent border border-border text-muted-color py-1.5 px-4 rounded-full cursor-pointer font-serif text-[0.76rem] tracking-[0.14em] uppercase transition-all ${
              filter === "mine" ? "bg-amber border-amber text-ink" : ""
            }`}
          >
            Mine
          </button>
        </div>

        <div className="relative">
          {/* Timeline axis */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(232,168,76,0.15)] to-transparent -translate-x-1/2" />

          {filteredMemories.length === 0 ? (
            <div className="text-center italic text-muted-color py-16">
              {filter === "mine"
                ? "You have not placed any memories yet."
                : "The atlas is empty. Be the first to place a memory."}
            </div>
          ) : (
            filteredMemories.map((memory, index) => {
              const isOwn = currentUser?.id === memory.user_id
              const isEven = index % 2 === 0

              return (
                <div
                  key={memory.id}
                  className={`flex gap-6 mb-11 animate-[rise_0.55s_ease_both] ${isEven ? "" : "flex-row-reverse"}`}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div
                    onClick={() => onViewMemory(memory)}
                    className={`flex-1 bg-mid border border-border rounded py-4 px-5 cursor-pointer transition-all hover:border-dim hover:bg-soft ${
                      isOwn ? "border-[rgba(126,207,160,0.2)]" : ""
                    }`}
                  >
                    <div className="text-[0.67rem] tracking-[0.2em] uppercase text-amber mb-1">
                      In memory of {memory.person_name}
                    </div>
                    <div className="text-[0.72rem] text-muted-color mb-1.5">{memory.place}</div>
                    <div className="font-serif text-[1.03rem] text-star leading-[1.5]">
                      {memory.text.length > 150 ? memory.text.slice(0, 150) + "..." : memory.text}
                    </div>
                    <div className="text-[0.7rem] text-muted-color mt-2 flex gap-2.5 flex-wrap">
                      <span>{formatDate(memory.created_at)}</span>
                      <span>by {memory.author_name || "someone"}</span>
                    </div>
                  </div>

                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 self-center relative z-10 ${
                      isOwn ? "bg-green" : "bg-amber"
                    }`}
                    style={{
                      boxShadow: isOwn ? "0 0 10px rgba(126,207,160,0.4)" : "0 0 10px rgba(232,168,76,0.4)",
                    }}
                  />

                  <div className="flex-1" />
                </div>
              )
            })
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(14px);
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
