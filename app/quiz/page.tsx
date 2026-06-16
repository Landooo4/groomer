import { Suspense } from 'react'
import QuizContent from './QuizContent'

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-slate-400 text-lg">Ładowanie pytań…</div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  )
}
