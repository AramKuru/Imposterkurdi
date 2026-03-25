import { pickRandomRound } from '../data/words'

const STORAGE_KEY = 'imposterkurdi_state'

export function createGame(players) {
  const state = loadState()
  const lastCategory = state?.categoryKey ?? null
  const lastWord = state?.word ?? null

  const { categoryKey, category, categoryEmoji, word } = pickRandomRound(lastCategory, lastWord)

  // Pick a random imposter index
  const imposterIndex = Math.floor(Math.random() * players.length)

  const newState = {
    players,           // array of name strings
    imposterIndex,     // who is the imposter
    categoryKey,
    category,
    categoryEmoji,
    word,
    phase: 'reveal',   // reveal | discuss | vote | results
    revealIndex: 0,    // which player is currently revealing
    votes: {},         // { voterName: suspectName }
    roundNumber: (state?.roundNumber ?? 0) + 1,
  }

  saveState(newState)
  return newState
}

export function saveState(state) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearState() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function advanceReveal(state) {
  const next = { ...state, revealIndex: state.revealIndex + 1 }
  if (next.revealIndex >= state.players.length) {
    next.phase = 'discuss'
  }
  saveState(next)
  return next
}

export function startVote(state) {
  const next = { ...state, phase: 'vote' }
  saveState(next)
  return next
}

export function submitVote(state, voterName, suspectName) {
  const votes = { ...state.votes, [voterName]: suspectName }
  const next = { ...state, votes }
  saveState(next)
  return next
}

export function finishVote(state) {
  const next = { ...state, phase: 'results' }
  saveState(next)
  return next
}

export function getResults(state) {
  // Count votes per suspect
  const tally = {}
  for (const suspect of Object.values(state.votes)) {
    tally[suspect] = (tally[suspect] ?? 0) + 1
  }
  // Who got the most votes?
  let topPlayer = null
  let topVotes = 0
  for (const [name, count] of Object.entries(tally)) {
    if (count > topVotes) {
      topVotes = count
      topPlayer = name
    }
  }
  const imposterName = state.players[state.imposterIndex]
  const caughtImposter = topPlayer === imposterName
  return { tally, topPlayer, topVotes, imposterName, caughtImposter }
}
