/* eslint-disable no-console */
import type { Division, DrawGenerator } from '@/lib/draw/types'
import { readFile } from 'node:fs/promises'

import { fernando } from '@/lib/draw/fernando'
import { fernandoBalanced } from '@/lib/draw/fernando-balanced'
import { createTournamentDraw as pbibdFactory } from '@/lib/draw/pbibd'
import { createTournamentDraw as pbibdLaneFactory, rotateAthletes } from '@/lib/draw/pbibd-lane'
import { analyzeDivision } from '@/lib/stats/analyze'
import { glob } from 'glob'
import { generateDiverseGroups as claude } from './draw/claude'

const cache = new Map<string, Division>()

const ITER_COUNT = 10
const ASN_TOLERANCE = 0.03

let lastTime = performance.now()
function iter(count: number, pbibdGen: typeof pbibdFactory, name: string): DrawGenerator {
  return (n, k, r) => {
    if (cache.get(`${name}-${n}-${k}-${r}`))
      return cache.get(`${name}-${n}-${k}-${r}`)!

    let best: Division = []
    let bestVC = Infinity
    let bestAsn = Infinity

    for (let i = 0; i < count; i++) {
      const draw = pbibdGen(n, k, r).generateTournament().map(r => r.map(h => h.map(a => a.id)))
      const analysis = analyzeDivision(draw)

      const asnChange = analysis.lanes.asnSumSqAvg / analysis.lanes.asnSumSqBest

      if (asnChange < (bestAsn + ASN_TOLERANCE)) {
        if (asnChange < bestAsn) {
          bestAsn = asnChange
        }

        if (analysis.matchups.varianceChange < bestVC) {
          bestVC = analysis.matchups.varianceChange
          best = draw
        }
      }

      // if (analysis.matchups.varianceChange < bestVC) {
      //   bestVC = analysis.matchups.varianceChange
      //   best = draw
      // }
    }

    const time = (performance.now() - lastTime) / count
    console.log(`Generating draw [${n}, ${k}, ${r}], 1 iter took ${time.toFixed(0)}ms (${((time) / 1000).toFixed(3)}s)`)
    lastTime = performance.now()
    cache.set(`${name}-${n}-${k}-${r}`, best)
    return name === 'pbibd_lane' ? rotateAthletes(best) : best
    // return best
  }
}

// const count = {f: 0, p: 0}
const pbibd_mix: DrawGenerator = (n, k, r) => {
  const f = fernandoBalanced(n, k, r)
  const fA = analyzeDivision(f)

  const p = iter(ITER_COUNT, pbibdFactory, 'pbibd')(n, k, r)
  const pA = analyzeDivision(p)

  // fA.matchups.varianceChange < pA.matchups.varianceChange ? count.f++ : count.p++
  return fA.matchups.varianceChange < pA.matchups.varianceChange ? f : p
}

let cpSatData: { draw: Division, status: string, parameters: [number, number, number] }[] = []
const cp_sat: DrawGenerator = (n, k, r) => {
  const cpSatResult = cpSatData.find(d => d.parameters[0] === n && d.parameters[1] === k && d.parameters[2] === r)
  console.log({ cpSatResult })

  if (!cpSatResult || !cpSatResult.draw.length)
    return fernando(n, k, r)

  const hc = Math.ceil(n / k)

  return cpSatResult.draw.reduce((acc, heat, i) => {
    const hi = i % hc
    if (hi === 0) {
      acc.push([])
    }
    acc[acc.length - 1].push(heat[0])
    return acc
  }, [] as Division)
}

export async function prepGenerate() {
  const path = (await glob('**/artefacts/cp-sat/combined/all.json'))[0]
  if (!path)
    throw new Error('No path found')

  cpSatData = JSON.parse(await readFile(path, { encoding: 'utf-8' }))
}

export const algorithms = {
  current: fernando,
  current_balanced: fernandoBalanced,
  claude,
  // claude2,
  pbibd: iter(ITER_COUNT, pbibdFactory, 'pbibd'),
  pbibd_lane: iter(ITER_COUNT, pbibdLaneFactory, 'pbibd_lane'),
  pbibd_mix,
  // pbibd_lane,
  cp_sat,
} as const satisfies Record<string, DrawGenerator>
export type Algos = typeof algorithms
export type AlgoEntry = [keyof Algos, DrawGenerator]
