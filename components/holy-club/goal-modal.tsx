'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from './toast-provider'

interface GoalModalProps {
  open: boolean
  onClose: () => void
}

export function GoalModal({ open, onClose }: GoalModalProps) {
  const { showToast } = useToast()
  const goals = useStore((s) => s.goals)
  const setGoals = useStore((s) => s.setGoals)

  const [wordGoal, setWordGoal] = useState(goals.word)
  const [prayGoal, setPrayGoal] = useState(goals.pray)
  const [mediaGoal, setMediaGoal] = useState(goals.media)

  useEffect(() => {
    if (open) {
      setWordGoal(goals.word)
      setPrayGoal(goals.pray)
      setMediaGoal(goals.media)
    }
  }, [open, goals])

  const handleSave = () => {
    setGoals({
      word: wordGoal || 20,
      pray: prayGoal || 15,
      media: mediaGoal || 90,
    })
    showToast('목표가 저장됐어요')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[60] flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet bg-white rounded-t-3xl p-6 w-full pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-[17px] font-bold text-accent">목표 설정</h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[22px] cursor-pointer text-gray-300 leading-none"
          >
            ×
          </button>
        </div>

        <label className="text-[13px] text-muted-foreground block mb-1">📖 하루 말씀 묵상 목표 (분)</label>
        <input
          type="number"
          value={wordGoal}
          onChange={(e) => setWordGoal(parseInt(e.target.value) || 20)}
          min={5}
          max={180}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary mb-2.5"
        />

        <label className="text-[13px] text-muted-foreground block mb-1">🙏 하루 기도 목표 (분)</label>
        <input
          type="number"
          value={prayGoal}
          onChange={(e) => setPrayGoal(parseInt(e.target.value) || 15)}
          min={5}
          max={180}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary mb-2.5"
        />

        <label className="text-[13px] text-muted-foreground block mb-1">📱 하루 미디어 한도 (분)</label>
        <input
          type="number"
          value={mediaGoal}
          onChange={(e) => setMediaGoal(parseInt(e.target.value) || 90)}
          min={10}
          max={480}
          className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary mb-2.5"
        />

        <button
          onClick={handleSave}
          className="w-full bg-primary text-white border-none rounded-[14px] py-3.5 text-[15px] font-semibold cursor-pointer transition-all active:scale-[0.98] active:opacity-90"
        >
          저장
        </button>
      </div>
    </div>
  )
}
