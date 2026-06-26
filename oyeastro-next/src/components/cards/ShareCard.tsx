'use client'

interface Props {
  onShare: () => void
}

export default function ShareCard({ onShare }: Props) {
  return (
    <div className="pin-card bg-bgWarm border-2 border-espresso rounded-neoLg p-6 shadow-neo break-inside-avoid mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-extrabold text-espresso text-base">Action Center</h3>
        <span className="px-2.5 py-1 text-xs font-bold border-2 border-espresso bg-white text-espresso rounded-neoSm shadow-neoSm">
          Export
        </span>
      </div>

      <button
        onClick={onShare}
        className="w-full py-3.5 bg-brightPurple text-white font-display text-base font-extrabold border-2 border-espresso rounded-neoSm shadow-neo hover:scale-102 hover:shadow-neoLg transition-all cursor-pointer"
      >
        ✨ Generate IG Story Card
      </button>
    </div>
  )
}
