import { fernando } from '@/lib/draw/fernando'
import { DrawGenerator } from '@/lib/draw/types'

import { generateDiverseGroups as claude } from './draw/28-01'
import { generateDiverseGroups as claude2 } from './draw/28-01-2'
import { createTournamentDraw } from '@/lib/create-tournament-draw'

const pbibd: DrawGenerator = (n, k, r) => createTournamentDraw(n, k, r).generateTournament().map(
  r => r.map(h => h.map(a => a.id))
)

export const algorithms = {
  current: fernando,
  claude,
  claude2,
  ross: pbibd
} as const satisfies Record<string, DrawGenerator>
export type Algos = typeof algorithms
export type AlgoEntry = [keyof Algos, DrawGenerator]
