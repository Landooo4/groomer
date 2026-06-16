'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions, sections } from '@/data/questions_all'

interface SectionProgress {
  answered: number
  correct: number
  completed: boolean
}

const SECTION_ICONS: Record<string, string> = {
  'Rachunkowość i matematyka': '🧮',
  'Rysunek zawodowy': '✏️',
  'BHP i ochrona przeciwpożarowa': '🔥',
  'Ochrona środowiska': '🌱',
  'Psychologia i pedagogika': '🧠',
  'Metodyka nauczania': '📚',
}

function getIcon(section: string) {
  return SECTION_ICONS[section] ?? '📖'
}

export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState<Record<string, SectionProgress>>({})

  const loadProgress = () => {
    const next: Record<string, SectionProgress> = {}
    sections.forEach((s) => {
      const raw = localStorage.getItem(`quiz_progress_${s}`)
      next[s] = raw ? JSON.parse(raw) : { answered: 0, correct: 0, completed: false }
    })
    setProgress(next)
  }

  useEffect(() => {
    loadProgress()
    window.addEventListener('focus', loadProgress)
    return () => window.removeEventListener('focus', loadProgress)
  }, [])

  const handleSection = (section: string) => {
    router.push(`/quiz?section=${encodeURIComponent(section)}`)
  }

  const handleAll = () => {
    router.push('/quiz?section=all')
  }

  const handleReset = () => {
    sections.forEach((s) => localStorage.removeItem(`quiz_progress_${s}`))
    loadProgress()
  }

  const totalQuestions = questions.length
  const totalCorrect = Object.values(progress).reduce((sum, p) => sum + p.correct, 0)
  const totalAnswered = Object.values(progress).reduce((sum, p) => sum + p.answered, 0)

  return (
    <main className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 text-center">
        <div className="text-4xl mb-2">🐕</div>
        <h1 className="text-2xl font-bold text-slate-900">Egzamin Groomera</h1>
        <p className="text-slate-500 text-sm mt-1">Fiszki do nauki</p>
        {totalAnswered > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full">
            <span>Łącznie: {totalCorrect}/{totalQuestions} poprawnych</span>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-3">
        {sections.map((section) => {
          const total = questions.filter((q) => q.section === section).length
          const prog = progress[section]
          const pct = prog?.answered > 0 ? Math.round((prog.correct / total) * 100) : null

          return (
            <button
              key={section}
              onClick={() => handleSection(section)}
              className="w-full bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(section)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-slate-800 text-sm leading-tight">{section}</h2>
                    {pct !== null ? (
                      <span
                        className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          pct >= 80
                            ? 'bg-green-100 text-green-700'
                            : pct >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {pct}%
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-slate-400">nie rozpoczęto</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{total} pytań</p>
                  {prog?.answered > 0 && (
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct! >= 80 ? 'bg-green-500' : pct! >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        <div className="pt-2 space-y-3">
          <button
            onClick={handleAll}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            🎲 Losuj wszystkie działy ({totalQuestions} pytań)
          </button>

          <button
            onClick={handleReset}
            className="w-full bg-white text-slate-500 rounded-2xl py-3 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Resetuj postęp
          </button>
        </div>
      </div>
    </main>
  )
}
