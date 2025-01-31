import type { Division, DrawGenerator } from '@/lib/draw/types'
import { createTournamentDraw } from '@/lib/create-tournament-draw'

import { fernando } from '@/lib/draw/fernando'
import { generateDiverseGroups as claude } from './draw/28-01'
import { analyzeDivision } from '@/lib/stats/analyze'

const pbibd: DrawGenerator = (n, k, r) => {
  let best: Division = []
  let bestVC = Infinity
  for (let i = 0; i < 50; i++) {
    console.log("Generating draw", i)
    const draw = createTournamentDraw(n, k, r).generateTournament().map(r => r.map(h => h.map(a => a.id)))
    const analysis = analyzeDivision(draw)
    if (analysis.matchups.varianceChange < bestVC) {
      bestVC = analysis.matchups.varianceChange
      best = draw
    }
  }
  return best
}

// const count = {f: 0, p: 0}
const frankenstein: DrawGenerator = (n, k, r) => {
  const f = fernando(n, k, r)
  const fA = analyzeDivision(f)

  const p = pbibd(n, k, r)
  const pA = analyzeDivision(p)

  // fA.matchups.varianceChange < pA.matchups.varianceChange ? count.f++ : count.p++
  return fA.matchups.varianceChange < pA.matchups.varianceChange ? f : p
}

export const algorithms = {
  current: fernando,
  claude,
  // claude2,
  pbibd,
  frankenstein
} as const satisfies Record<string, DrawGenerator>
export type Algos = typeof algorithms
export type AlgoEntry = [keyof Algos, DrawGenerator]
