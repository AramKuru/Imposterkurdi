'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, submitVote, finishVote } from '../../lib/game'

export default function Vote() {
  const router = useRouter()
  const [state, setState] = useState(null)
  // voterIndex: which player is currently voting
  const [voterIndex, setVoterIndex] = useState(0)
  // selectedSuspect: name of suspect the current voter chose
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('pick') // pick | confirm

  useEffect(() => {
    const s = loadState()
    if (!s) { router.replace('/'); return }
    if (s.phase !== 'vote') {
      if (s.phase === 'discuss') router.replace('/discuss')
      else if (s.phase === 'results') router.replace('/results')
      else if (s.phase === 'reveal') router.replace('/reveal')
      return
    }
    setState(s)
  }, [router])

  if (!state) return <LoadingScreen />

  const voter = state.players[voterIndex]
  const suspects = state.players.filter((_, i) => i !== voterIndex)
  const votesLeft = state.players.length - Object.keys(state.votes).length
  const progress = Object.keys(state.votes).length / state.players.length

  const confirmVote = () => {
    if (!selected) return
    const next = submitVote(state, voter, selected)
    setState(next)

    const nextVoterIndex = voterIndex + 1
    if (nextVoterIndex >= state.players.length) {
      // All voted
      const final = finishVote(next)
      setState(final)
      router.push('/results')
    } else {
      setVoterIndex(nextVoterIndex)
      setSelected(null)
      setPhase('pick')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-black text-white mb-1">🗳️ دەنگدان</h1>
        <div className="w-full bg-white/5 rounded-full h-1.5 mt-3">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-white/40 text-xs mt-2">
          {Object.keys(state.votes).length} / {state.players.length} دەنگیان دا
        </p>
      </div>

      {/* Current voter */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
        <div className="text-center game-card p-6 w-full">
          <div className="text-4xl mb-2">🙋</div>
          <p className="text-white/40 text-sm mb-1">ئێستا نۆبەتی</p>
          <p className="text-2xl font-black text-white">{voter}</p>
          <p className="text-white/40 text-sm mt-2">کێی بۆ ئیمپۆستەر دادەنێیت؟</p>
        </div>

        {/* Suspect list */}
        <div className="w-full flex flex-col gap-3">
          {suspects.map((suspect) => (
            <button
              key={suspect}
              onClick={() => setSelected(suspect)}
              className={`vote-item w-full game-card p-4 flex items-center justify-between
                          border transition-all duration-150 rounded-2xl text-right
                          ${selected === suspect ? 'selected' : ''}`}
            >
              <span className="text-white font-bold text-lg">{suspect}</span>
              <span className={`text-2xl transition-transform duration-150 ${selected === suspect ? 'scale-125' : 'scale-100'}`}>
                {selected === suspect ? '🎯' : '○'}
              </span>
            </button>
          ))}
        </div>

        {/* Confirm */}
        <button
          onClick={confirmVote}
          disabled={!selected}
          className="w-full btn-primary py-5 text-xl rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {voterIndex === state.players.length - 1
            ? `✅ دەنگ بدە بۆ ${selected ?? '...'} — ئەنجام ببینە`
            : `✅ دەنگ بدە بۆ ${selected ?? '...'}`}
        </button>
      </div>

      <div className="h-4" />
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
