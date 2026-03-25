'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { roomExists } from '../lib/room'

export default function Home() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [tab, setTab] = useState('main') // main | join

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length !== 4) { setJoinError('کۆدی ژوورەکە ٤ پیت دەبێت'); return }
    if (!roomExists(code)) { setJoinError('ژوورێک بە ئەم کۆدە نەدۆزرایەوە'); return }
    router.push(`/room/${code}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="text-7xl mb-4">🕵️</div>
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent leading-tight">
          ئیمپۆستەر
        </h1>
        <h2 className="text-3xl font-bold text-purple-300">کوردی</h2>
        <p className="text-white/40 text-sm mt-4 leading-relaxed">
          یاری سۆشیاڵ بە زمانی کوردی · ئیمپۆستەرەکە بدۆزەوە!
        </p>
      </div>

      <div className="w-full max-w-sm animate-fade-in-up">
        {tab === 'main' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push('/create')}
              className="btn-primary text-xl py-5 rounded-2xl shadow-2xl shadow-purple-900/50 flex items-center justify-center gap-3"
            >
              <span>🏠</span>
              <span>دروستکردنی ژوور</span>
            </button>

            <button
              onClick={() => setTab('join')}
              className="btn-secondary text-lg py-4 rounded-2xl flex items-center justify-center gap-3"
            >
              <span>🚪</span>
              <span>چوونە ژوورێک</span>
            </button>
          </div>
        )}

        {tab === 'join' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setTab('main'); setJoinError('') }}
              className="text-white/40 hover:text-white self-start transition text-sm flex items-center gap-1"
            >
              ← گەڕانەوە
            </button>

            <div className="game-card p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white text-center">چوونە ژوورێک</h2>
              <input
                className="input-field text-center text-2xl font-black tracking-widest uppercase"
                type="text"
                placeholder="کۆدی ژوور"
                maxLength={4}
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase())
                  setJoinError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              {joinError && (
                <p className="text-red-400 text-sm text-center">{joinError}</p>
              )}
              <button
                onClick={handleJoin}
                className="btn-primary py-4 text-lg rounded-xl"
              >
                بچوو
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How to play */}
      <div className="mt-14 w-full max-w-sm animate-fade-in-up">
        <p className="text-white/30 text-xs font-bold mb-4 text-center tracking-widest uppercase">
          چۆن یاری بکرێت
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            { icon: '🏠', text: 'ژووری نوێ دروست بکە و کۆدەکە بۆ هاوڕێکانت بنێرە' },
            { icon: '✍️', text: 'ناوی یارمەتیدەران زیاد بکە و ژمارەی دۆرەکان هەڵبژێرە' },
            { icon: '🤫', text: 'هەر کەسێک بە تەنیا وشەکەی خۆی دەبینێت' },
            { icon: '🎭', text: 'ئیمپۆستەر تەنها کەتەگۆریەکەی دەزانێت — بیشارە!' },
            { icon: '🏆', text: 'لیستی نمرەکان دوای هەر دۆرەیەک نوێ دەبێتەوە' },
          ].map((s, i) => (
            <div key={i} className="game-card p-3.5 flex items-start gap-3">
              <span className="text-xl shrink-0">{s.icon}</span>
              <span className="text-white/60 text-sm leading-relaxed">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
