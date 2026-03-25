'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '../../lib/room'

const MIN_PLAYERS = 3
const MAX_PLAYERS = 10
const ROUND_OPTIONS = [3, 5, 7, 10]

export default function CreateRoom() {
  const router = useRouter()
  const [players, setPlayers] = useState(['', '', ''])
  const [totalRounds, setTotalRounds] = useState(5)
  const [error, setError] = useState('')

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    setPlayers([...players, ''])
  }

  const removePlayer = (i) => {
    if (players.length <= MIN_PLAYERS) return
    setPlayers(players.filter((_, idx) => idx !== i))
  }

  const updatePlayer = (i, val) => {
    const next = [...players]
    next[i] = val
    setPlayers(next)
  }

  const handleCreate = () => {
    const filled = players.map((p) => p.trim()).filter(Boolean)
    if (filled.length < MIN_PLAYERS) {
      setError(`کەمەتر لە ${MIN_PLAYERS} یارمەتیدەر ناکات`)
      return
    }
    const unique = new Set(filled.map((p) => p.toLowerCase()))
    if (unique.size < filled.length) {
      setError('ناوی دووجار هەیە — هەر ناوێک جیاوازبێت')
      return
    }
    setError('')
    const room = createRoom(filled, totalRounds)
    router.push(`/room/${room.roomId}`)
  }

  const filledCount = players.filter((p) => p.trim()).length

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition text-2xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">دروستکردنی ژوور</h1>
          <p className="text-white/40 text-sm">{filledCount}/{MAX_PLAYERS} یارمەتیدەر</p>
        </div>
      </div>

      {/* Rounds selector */}
      <div className="w-full max-w-sm mb-6">
        <p className="text-white/50 text-sm mb-3">ژمارەی دۆرەکان</p>
        <div className="grid grid-cols-4 gap-2">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setTotalRounds(n)}
              className={`py-3 rounded-xl font-black text-lg transition-all duration-150 border
                ${totalRounds === n
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Player inputs */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-4">
        {players.map((name, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-purple-800/50 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
              {i + 1}
            </div>
            <input
              className="input-field flex-1"
              type="text"
              placeholder={`یارمەتیدەر ${i + 1}`}
              value={name}
              maxLength={20}
              onChange={(e) => updatePlayer(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && i === players.length - 1 && players.length < MAX_PLAYERS) {
                  addPlayer()
                }
              }}
            />
            <button
              onClick={() => removePlayer(i)}
              disabled={players.length <= MIN_PLAYERS}
              className="text-white/20 hover:text-red-400 transition disabled:opacity-20 disabled:cursor-not-allowed text-xl w-8 shrink-0 text-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add player */}
      {players.length < MAX_PLAYERS && (
        <button
          onClick={addPlayer}
          className="w-full max-w-sm border-2 border-dashed border-white/10 hover:border-purple-500/40
                     text-white/40 hover:text-purple-300 rounded-xl py-3 mb-6 transition-all duration-200
                     flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>یارمەتیدەری زیاد بکە</span>
        </button>
      )}

      {error && (
        <div className="w-full max-w-sm mb-4 bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={filledCount < MIN_PLAYERS}
        className="w-full max-w-sm btn-primary text-xl py-5 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🚀 دروستکردنی ژوور
      </button>

      <p className="mt-4 text-white/20 text-xs text-center">
        لانیکەم {MIN_PLAYERS} · زۆرترین {MAX_PLAYERS} یارمەتیدەر
      </p>
    </main>
  )
}
