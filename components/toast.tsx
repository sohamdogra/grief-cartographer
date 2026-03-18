"use client"

interface ToastProps {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className={`fixed bottom-5 left-1/2 z-[9500] bg-surface border border-border rounded py-2.5 px-5 text-[0.81rem] text-text tracking-[0.06em] pointer-events-none transition-transform duration-300 ${
        message ? "-translate-x-1/2 translate-y-0" : "-translate-x-1/2 translate-y-14"
      }`}
    >
      {message}
    </div>
  )
}
