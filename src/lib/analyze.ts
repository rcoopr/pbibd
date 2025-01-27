import type { Athlete, DrawResult, Root } from '../types'
import type { Division } from './draw/types'
import { getMetrics } from './TournamentDraw'

export function analyzeLiveheatsDraw(heats: Root['heats']): DrawResult {
  const athletes: Athlete[] = Array.from(
    new Set(heats.map(heat => heat.competitors.map(c => c.athleteId)).flat()),
  ).map(id => ({ id: Number(id), facedCount: new Map() }))
  athletes.forEach((athlete) => {
    athletes.forEach((other) => {
      if (athlete.id !== other.id) {
        athlete.facedCount.set(other.id, 0)
      }
    })
  })

  const roundHash = heats.reduce((acc, heat) => {
    if (acc[heat.group.roundName]) {
      acc[heat.group.roundName].push(heat.competitors)
    }
    else {
      acc[heat.group.roundName] = [heat.competitors]
    }
    return acc
  }, {} as Record<string, Root['heats'][number]['competitors'][]>)

  const rounds: Athlete[][][] = Object.entries(roundHash)
    .filter(([key]) => key.startsWith('Round'))
    .map(([_, heats]) => heats.map(heat => heat.map(c => athletes.find(a => a.id === Number(c.athleteId))!)),
    )

  const tournament: Athlete[][][] = []
  for (const round of rounds) {
    round.forEach((heat) => {
      for (let i = 0; i < heat.length; i++) {
        for (let j = i + 1; j < heat.length; j++) {
          const count1 = heat[i].facedCount.get(heat[j].id) || 0
          const count2 = heat[j].facedCount.get(heat[i].id) || 0
          heat[i].facedCount.set(heat[j].id, count1 + 1)
          heat[j].facedCount.set(heat[i].id, count2 + 1)
        }
      }
    })
    tournament.push(round)
  }

  return {
    metrics: getMetrics(
      athletes,
      Math.round(heats.reduce((acc, heat) => acc + heat.config.heatSize, 0) / heats.length),
      rounds.length,
    ),
    draw: tournament,
    iteration: 1,
  }
}

export function analyzeDraw(draw: Division) {
  const athletes: Athlete[] = Array.from(new Set(draw.flat(Infinity)))
    .map(id => ({ id: Number(id), facedCount: new Map() }))

  athletes.forEach((athlete) => {
    athletes.forEach((other) => {
      if (athlete.id !== other.id) {
        athlete.facedCount.set(other.id, 0)
      }
    })
  })

  const drawWithMaps = draw.map(round => round.map(heat => heat.map(c => athletes.find(a => a.id === c)!)))

  const tournament: Athlete[][][] = []
  for (const round of drawWithMaps) {
    round.forEach((heat) => {
      for (let i = 0; i < heat.length; i++) {
        for (let j = i + 1; j < heat.length; j++) {
          const count1 = heat[i].facedCount.get(heat[j].id) || 0
          const count2 = heat[j].facedCount.get(heat[i].id) || 0
          heat[i].facedCount.set(heat[j].id, count1 + 1)
          heat[j].facedCount.set(heat[i].id, count2 + 1)
        }
      }
    })
    tournament.push(round)
  }

  return {
    metrics: getMetrics(
      athletes,
      Math.round(draw.reduce((acc, round) => acc + round.length, 0) / draw.length),
      draw.length,
    ),
    draw: tournament,
    iteration: 1,
  }
}
