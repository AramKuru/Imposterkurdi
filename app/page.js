'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { loadState } from '../lib/game'

export default function Home() {
  const router = useRouter()
  const [hasGame, setHasGame] = useState(false)

  useEffect(() => {
    const state = loadState()
    setHasGame(!!state && state.phase !== 'results')
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Title */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="text-7xl mb-4">🕵️</div>
        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent leading-tight">
          ئیمپۆستەر
        </h1>
        <h2 className="text-3xl font-bold text-purple-300 mb-2">کوردی</h2>
        <p className="text-white/50 text-lg mt-4 leading-relaxed max-w-xs mx-auto">
          یارییەکی سۆشیاڵ بۆ کۆمەڵێک هاوڕێ·<br />
          ئیمپۆستەرەکە بدۆزەوە!
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-in-up">
        <button
          onClick={() => router.push('/setup')}
          className="btn-primary text-xl py-5 rounded-2xl shadow-2xl shadow-purple-900/50 flex items-center justify-center gap-3"
        >
          <span>🎮</span>
          <span>یاری نوێ</span>
        </button>

        {hasGame && (
          <button
            onClick={() => {
              const state = loadState()
              if (!state) return
              if (state.phase === 'reveal') router.push('/reveal')
              else if (state.phase === 'discuss') router.push('/discuss')
              else if (state.phase === 'vote') router.push('/vote')
            }}
            className="btn-secondary text-lg py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            <span>▶️</span>
            <span>بەردەوام بە</span>
          </button>
        )}
      </div>

      {/* How to play */}
      <div className="mt-16 w-full max-w-sm animate-fade-in-up">
        <h3 className="text-white/60 text-sm font-bold mb-4 text-center tracking-widest uppercase">
          چۆن یاری بکرێت
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { icon: '✍️', text: 'ناوەکانی یارمەتیدەران بنووسە (٥-١٠ کەس)' },
            { icon: '🤫', text: 'هەر کەسێک بە تەنیا وشەکەی خۆی دەبینێت' },
            { icon: '💬', text: 'باس بکەن — ئیمپۆستەرەکە تەنها کەتەگۆریەکەی دەزانێت' },
            { icon: '🗳️', text: 'دەنگ بدەن — ئایا دەیگیرن؟' },
          ].map((step, i) => (
            <div key={i} className="game-card p-4 flex items-start gap-3">
              <span className="text-2xl">{step.icon}</span>
              <span className="text-white/80 text-sm leading-relaxed">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-white/20 text-xs">
        بە هەموو وشەکان بە کوردی
      </p>
    </main>
  )
}
