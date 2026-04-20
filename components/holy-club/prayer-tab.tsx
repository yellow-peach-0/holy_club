'use client'

import { useState } from 'react'
import { useStore, getTodayKey, PrayerNote } from '@/lib/store'
import { Stopwatch } from './stopwatch'
import { useToast } from './toast-provider'
import { Check, X } from 'lucide-react'

export function PrayerTab() {
  const [showModal, setShowModal] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const { showToast } = useToast()

  const today = getTodayKey()
  const prayTime = useStore((s) => s.prayTime)
  const goals = useStore((s) => s.goals)
  const prayNotes = useStore((s) => s.prayNotes)
  const addPrayerNote = useStore((s) => s.addPrayerNote)
  const togglePrayerNote = useStore((s) => s.togglePrayerNote)
  const deletePrayerNote = useStore((s) => s.deletePrayerNote)

  const todaySeconds = prayTime[today] || 0
  const answeredCount = prayNotes.filter((n) => n.answered).length

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      showToast('기도 제목을 입력해주세요')
      return
    }
    const d = new Date()
    addPrayerNote({
      title: noteTitle.trim(),
      body: noteBody.trim(),
      date: `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`,
      answered: false,
    })
    setNoteTitle('')
    setNoteBody('')
    setShowModal(false)
    showToast('기도 제목이 추가됐어요 📝')
  }

  const handleToggle = (id: string) => {
    const note = prayNotes.find((n) => n.id === id)
    togglePrayerNote(id)
    if (note && !note.answered) {
      showToast('할렐루야! 응답받으셨군요')
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('기도 제목을 삭제할까요?')) {
      deletePrayerNote(id)
    }
  }

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <h2 className="m-0 text-xl font-bold text-accent">기도</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white border-none rounded-[10px] px-4 py-2 text-[13px] font-semibold cursor-pointer"
        >
          + 기도 제목
        </button>
      </div>

      <Stopwatch type="pray" todaySeconds={todaySeconds} goal={goals.pray} onSave={() => {}} />

      {/* Prayer Notes */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-card-foreground">기도 노트</span>
          <span className="text-[12px] text-muted-foreground">
            응답 {answeredCount}/{prayNotes.length}
          </span>
        </div>

        {prayNotes.length === 0 ? (
          <div className="text-center py-7 text-input text-sm">기도 제목을 추가해보세요 🙏</div>
        ) : (
          <div>
            {[...prayNotes].reverse().map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-2.5 py-3 border-b border-muted last:border-none"
              >
                <div
                  onClick={() => handleToggle(note.id)}
                  className={`w-[22px] h-[22px] rounded-full border-2 flex-shrink-0 cursor-pointer flex items-center justify-center mt-0.5 transition-all ${
                    note.answered ? 'bg-primary border-primary' : 'border-input'
                  }`}
                >
                  {note.answered && <Check className="w-[11px] h-[11px] text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold break-keep ${
                      note.answered ? 'text-[#C4B5FD] line-through' : 'text-foreground'
                    }`}
                  >
                    {note.title}
                  </div>
                  {note.body && (
                    <div className="text-[12px] text-gray-400 mt-0.5 whitespace-pre-wrap break-keep">
                      {note.body}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-200 mt-1">{note.date}</div>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="bg-transparent border-none text-gray-200 text-lg cursor-pointer p-0 pl-2 flex-shrink-0 leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/45 z-[60] flex items-end"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal-sheet bg-white rounded-t-3xl p-6 w-full pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-[17px] font-bold text-accent">기도 제목 추가</h3>
              <button
                onClick={() => setShowModal(false)}
                className="bg-transparent border-none text-[22px] cursor-pointer text-gray-300 leading-none"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="기도 제목"
              className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary mb-2.5"
              autoFocus
            />
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="기도 내용 (선택)"
              rows={3}
              className="w-full border-[1.5px] border-input rounded-xl p-3 text-[15px] outline-none transition-colors focus:border-primary mb-2.5 resize-none"
            />
            <button
              onClick={handleSaveNote}
              className="w-full bg-primary text-white border-none rounded-[14px] py-3.5 text-[15px] font-semibold cursor-pointer transition-all active:scale-[0.98] active:opacity-90"
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
