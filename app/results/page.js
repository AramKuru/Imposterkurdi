'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, getResults, createGame } from '../../lib/game'

export default function Results() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [results, setResults] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const s = loadState()
    if (!s) { router.replace('/'); return }
    if (s.phase !== 'results') {
      router.replace('/')
      return
    }
    setState(s)
    setResults(getResults(s))
  }, [router])

  if (!state || !results) return <LoadingScreen />

  const playAgainSamePlayers = () => {
    // createGame picks a NEW random word/category (different from last round)
    createGame(state.players)
    router.push('/reveal')
  }

  const newGame = () => {
    router.push('/setup')
  }

  const { tally, imposterName, caughtImposter, topPlayer, topVotes } = results

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-black text-white mb-1">ئەنجامەکان</h1>
        <p className="text-white/40 text-sm">دۆرەی {state.roundNumber}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-sm">
        {/* Reveal imposter button */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full game-card p-8 flex flex-col items-center gap-4
                       hover:border-purple-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl animate-pulse-slow">🎭</div>
            <p className="text-white/60 font-bold text-lg">بکە بۆ دیتنی ئیمپۆستەر</p>
          </button>
        ) : (
          <>
            {/* Result banner */}
            <div className={`w-full rounded-3xl p-6 text-center ${
              caughtImposter
                ? 'bg-green-900/30 border border-green-500/40'
                : 'imposter-card'
            }`}>
              <div className="text-5xl mb-3">{caughtImposter ? '🎉' : '😈'}</div>
              <p className={`text-2xl font-black ${caughtImposter ? 'text-green-300' : 'text-red-300'}`}>
                {caughtImposter ? 'کۆمەڵ بردی!' : 'ئیمپۆستەر بردی!'}
              </p>
              <p className="text-white/50 text-sm mt-2">
                {caughtImposter
                  ? `دەنگی زۆرینە بۆ ${topPlayer} (${topVotes} دەنگ)`
                  : `ئیمپۆستەر شارد — ${topPlayer || 'کەس'} زۆرترین دەنگی وەرگرت`}
              </p>
            </div>

            {/* Imposter reveal */}
            <div className="w-full game-card p-5 flex items-center gap-4">
              <div className="text-4xl">🎭</div>
              <div>
                <p className="text-white/50 text-sm">ئیمپۆستەرەکە بوو</p>
                <p className="text-white font-black text-2xl">{imposterName}</p>
              </div>
            </div>

            {/* The word */}
            <div className="w-full game-card p-5 text-center">
              <p className="text-white/40 text-sm mb-1">{state.categoryEmoji} {state.category}</p>
              <p className="word-glow text-white font-black text-3xl">{state.word}</p>
              <p className="text-white/30 text-xs mt-2">وشەی ئەم دۆرە</p>
            </div>

            {/* Vote tally */}
            <div className="w-full game-card p-5">
              <p className="text-white/50 text-sm font-bold mb-3">📊 هەژمارکردنی دەنگەکان</p>
              <div className="flex flex-col gap-2">
                {state.players.map((player) => {
                  const voteCount = tally[player] ?? 0
                  const pct = state.players.length > 0 ? (voteCount / state.players.length) * 100 : 0
                  const isImposter = player === imposterName
                  return (
                    <div key={player} className="flex items-center gap-3">
                      <span className={`text-sm w-24 shrink-0 font-medium ${isImposter ? 'text-red-300' : 'text-white/70'}`}>
                        {player} {isImposter ? '🎭' : ''}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${isImposter ? 'bg-red-500' : 'bg-purple-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs w-6 text-center">{voteCount}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Who voted whom */}
            <div className="w-full game-card p-5">
              <p className="text-white/50 text-sm font-bold mb-3">🗳️ کێ بۆ کێ دەنگ دا</p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(state.votes).map(([voter, suspect]) => (
                  <div key={voter} className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">{voter}</span>
                    <span className="text-white/20">←</span>
                    <span className="text-purple-300 font-medium">{suspect}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      {revealed && (
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button onClick={playAgainSamePlayers} className="btn-primary w-full py-5 text-lg rounded-2xl">
            🔄 دۆرەی نوێ — هەمان یارمەتیدەران
          </button>
          <button onClick={newGame} className="btn-secondary w-full py-4 rounded-2xl">
            🎮 یاری نوێ — یارمەتیدەری نوێ
          </button>
        </div>
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-2xl animate-pulse-slow">⏳</div>
    </main>
  )
}
