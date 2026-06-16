'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { questions, Question } from '@/data/questions_all'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type AnswerKey = 'a' | 'b' | 'c'

export default function QuizContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectionParam = searchParams.get('section') ?? 'all'

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<AnswerKey | null>(null)
  const [answered, setAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const filtered =
      sectionParam === 'all'
        ? questions
        : questions.filter((q) => q.section === sectionParam)
    setQuizQuestions(shuffle(filtered))
    setCurrentIndex(0)
    setSelected(null)
    setAnswered(false)
    setCorrectCount(0)
    setFinished(false)
  }, [sectionParam])

  const current = quizQuestions[currentIndex]

  const handleAnswer = useCallback(
    (key: AnswerKey) => {
      if (answered || !current) return
      setSelected(key)
      setAnswered(true)
      if (key === current.correct) {
        setCorrectCount((c) => c + 1)
      }
    },
    [answered, current]
  )

  const handleNext = useCallback(() => {
    const nextIdx = currentIndex + 1
    const isFinished = nextIdx >= quizQuestions.length

    if (sectionParam !== 'all') {
      localStorage.setItem(
        `quiz_progress_${sectionParam}`,
        JSON.stringify({ answered: currentIndex + 1, correct: correctCount, completed: isFinished })
      )
    }

    if (isFinished) {
      setFinished(true)
    } else {
      setCurrentIndex(nextIdx)
      setSelected(null)
      setAnswered(false)
    }
  }, [currentIndex, quizQuestions.length, sectionParam, correctCount])

  const handleRestart = () => {
    setQuizQuestions((q) => shuffle([...q]))
    setCurrentIndex(0)
    setSelected(null)
    setAnswered(false)
    setCorrectCount(0)
    setFinished(false)
  }

  // keyboard: space / enter → next, a/b/c → pick answer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['a', 'b', 'c'].includes(e.key) && !answered) {
        handleAnswer(e.key as AnswerKey)
      }
      if ((e.key === ' ' || e.key === 'Enter') && answered && !finished) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [answered, finished, handleAnswer, handleNext])

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">Ładowanie pytań…</div>
      </div>
    )
  }

  // ── Results screen ──────────────────────────────────────────────
  if (finished) {
    const total = quizQuestions.length
    const pct = Math.round((correctCount / total) * 100)
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'
    const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
    const barColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Koniec quizu!</h2>
            <p className="text-sm text-slate-500 mb-6">
              {sectionParam === 'all' ? 'Wszystkie działy' : sectionParam}
            </p>

            <div className={`text-6xl font-bold mb-1 ${color}`}>{pct}%</div>
            <p className="text-slate-500 text-sm mb-4">
              {correctCount} z {total} poprawnych odpowiedzi
            </p>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-8">
              <div
                className={`h-3 rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-indigo-600 text-white rounded-2xl py-3.5 font-bold hover:bg-indigo-700 transition-colors"
              >
                Powtórz quiz
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-white text-slate-600 rounded-2xl py-3.5 font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                ← Wróć do menu
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz screen ─────────────────────────────────────────────────
  const isCorrect = selected === current.correct
  const progress = ((currentIndex) / quizQuestions.length) * 100

  const answerClass = (key: AnswerKey) => {
    const base = 'w-full text-left rounded-2xl border-2 px-4 py-3.5 font-medium transition-all leading-snug '
    if (!answered) {
      return base + 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.99]'
    }
    if (key === current.correct) {
      return base + 'bg-green-50 border-green-500 text-green-900'
    }
    if (key === selected) {
      return base + 'bg-red-50 border-red-400 text-red-900'
    }
    return base + 'bg-white border-slate-100 text-slate-400'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push('/')}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1"
            >
              ← Powrót
            </button>
            <span className="text-sm text-slate-500 font-semibold">
              {currentIndex + 1} / {quizQuestions.length}
            </span>
            <span className="text-sm font-semibold text-indigo-600 w-16 text-right">
              {correctCount} ✓
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Section chip */}
        <div className="mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
            {current.section}
          </span>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-5 mb-4">
          <p className="text-base font-semibold text-slate-900 leading-relaxed">
            {current.question}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="space-y-3 mb-4">
          {(['a', 'b', 'c'] as AnswerKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              disabled={answered}
              className={answerClass(key)}
            >
              <span className="inline-block w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold text-center leading-6 mr-3 shrink-0 float-left">
                {key.toUpperCase()}
              </span>
              <span>{current.options[key]}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`rounded-2xl px-4 py-4 mb-4 border ${
              isCorrect
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <p className="font-bold text-base mb-1">
              {isCorrect ? '✅ Brawo!' : '❌ Niepoprawna odpowiedź'}
            </p>
            <p className="text-sm leading-relaxed opacity-90">{current.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-base hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            {currentIndex + 1 >= quizQuestions.length
              ? 'Zobacz wyniki 🏁'
              : 'Następne pytanie →'}
          </button>
        )}

        {!answered && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Naciśnij A, B lub C na klawiaturze
          </p>
        )}
      </div>
    </div>
  )
}
