"use client"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,6,18,0.9)] backdrop-blur-[12px] transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-deep border border-border rounded px-10 py-9 max-w-[420px] w-[90%] relative">
        <div className="font-serif text-[0.88rem] tracking-[0.2em] uppercase text-amber mb-1.5">
          Remove this memory?
        </div>
        <div className="italic text-[0.87rem] text-muted-color mb-5 leading-[1.55]">
          This cannot be undone. The memory will be removed from the shared map for everyone.
        </div>

        <div className="flex gap-2.5 mt-5 flex-wrap">
          <button
            onClick={onConfirm}
            className="py-2.5 px-5 rounded cursor-pointer font-serif text-[0.82rem] tracking-[0.18em] uppercase transition-all bg-transparent border border-danger text-danger hover:bg-danger hover:text-white"
          >
            Yes, remove it
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded cursor-pointer font-serif text-[0.82rem] tracking-[0.18em] uppercase transition-all bg-transparent border border-[rgba(255,255,255,0.11)] text-muted-color hover:border-dim hover:text-amber"
          >
            Keep it
          </button>
        </div>
      </div>
    </div>
  )
}
