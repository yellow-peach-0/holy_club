'use client'

import { useStopwatch } from '@/hooks/use-stopwatch'
import { formatTime, formatMinutes, getTodayKey, useStore } from '@/lib/store'
import { useToast } from './toast-provider'
import { CHEERS } from '@/lib/constants'

interface StopwatchProps {
  type: 'medi' | 'pray'
  todaySeconds: number
  goal: number
  onSave: () => void
}

export function Stopwatch({ type, todaySeconds, goal, onSave }: StopwatchProps) {
  const { elapsed, running, toggle, reset, getElapsed } = useStopwatch()
  const { showToast } = useToast()
  const addWordTime = useStore((s) => s.addWordTime)
  const addPrayTime = useStore((s) => s.addPrayTime)
  const updateStreak = useStore((s) => s.updateStreak)

  const handleSave = () => {
    const seconds = getElapsed()
    if (seconds < 10) {
      showToast('10초 이상 기록해야 저장할 수 있어요')
      return
    }
    
    const today = getTodayKey()
    if (type === 'medi') {
      addWordTime(today, seconds)
      showToast(CHEERS[Math.floor(Math.random() * CHEERS.length)])
    } else {
      addPrayTime(today, seconds)
      showToast('기도 시간이 저장됐어요 🙏')
    }
    
    updateStreak(today, true)
    reset()
    onSave()
  }

  return (
    <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
      <div className="text-[11px] text-muted-foreground text-center mb-1.5">
        {type === 'medi' ? '묵상 타이머' : '기도 타이머'}
      </div>
      <div className="text-[54px] font-extralight tracking-wider font-[tabular-nums] text-accent text-center leading-none">
        {formatTime(elapsed)}
      </div>
      <div className="flex justify-center items-center gap-5 mt-4">
        <button
          onClick={reset}
          className="w-14 h-14 rounded-full border-none text-[12px] font-semibold cursor-pointer bg-secondary text-secondary-foreground flex items-center justify-center transition-transform active:scale-[0.94]"
        >
          초기화
        </button>
        <button
          onClick={toggle}
          className={`w-[76px] h-[76px] rounded-full border-none text-[15px] font-semibold cursor-pointer text-white flex items-center justify-center transition-all active:scale-[0.94] ${
            running ? 'bg-destructive' : 'bg-primary'
          }`}
        >
          {running ? '일시정지' : '시작'}
        </button>
        <button
          onClick={handleSave}
          className="w-14 h-14 rounded-full border-none text-[12px] font-semibold cursor-pointer bg-secondary text-secondary-foreground flex items-center justify-center transition-transform active:scale-[0.94]"
        >
          저장
        </button>
      </div>
      <div className="text-center mt-2.5 text-[12px] text-gray-400">
        오늘 누적: <b className="text-primary">{formatMinutes(todaySeconds)}</b>
        &nbsp;·&nbsp; 목표: <b className="text-muted-foreground">{goal}분</b>
      </div>
    </div>
  )
}
