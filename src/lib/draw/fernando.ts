import type { DrawGenerator } from './types'
import { shuffle } from '../utils'

export const fernando: DrawGenerator = (athleteCount, heatSize, roundCount) => {
  const heatCount = Math.ceil(athleteCount / heatSize)

  const divisionsWithSortOrder = Array.from({ length: roundCount }).map((_, i) => ({
    sortOrder: i,
  }))

  const division = divisionsWithSortOrder.map(round => (Array.from({ length: athleteCount }).map((_, i) => i)).reduce((acc, seed) => {
    const [child, position] = getChildAndPosition(seed, {
      heatCount,
      heatSize,
      roundIndex: round.sortOrder,
      roundCount,
    })

    acc[child] ||= []
    acc[child][position] = (seed + 1 % athleteCount) || athleteCount
    return acc
  }, [] as number[][]))

  return division.map(r => r.map(h => h.filter(a => a === 0 || !!a)))
}

export function getChildAndPosition(seed: number, config: {
  heatCount: number
  heatSize: number
  roundIndex: number
  roundCount: number
  shuffle?: boolean
}): [number, number] {
  const numberOfChildren = config.heatCount
  const contestantsPerChild = config.heatSize
  const totalContestants = numberOfChildren * contestantsPerChild
  const positions = Array.from({ length: totalContestants }).map((_, i) => i)
  if (config.shuffle)
    shuffle(positions)
  const initialSeed = positions.indexOf(seed)
  const newSeed = (config.roundIndex * (initialSeed % contestantsPerChild) * contestantsPerChild + initialSeed) % totalContestants

  const childOrder = roundSeedOrderNew(contestantsPerChild, numberOfChildren)
  const childPosition = childOrder[newSeed % childOrder.length]
  let position = childOrder.slice(0, newSeed).filter(v => v === childPosition).length
  position = (position + Math.round(config.roundIndex * contestantsPerChild / config.roundCount)) % contestantsPerChild
  return [childPosition, position]
}

// This function generates an array where each child position is repeated 'contestantsPerChild' times.
// For example, if contestantsPerChild = 3 and numberOfChildren = 2, the output will be:
// [0, 0, 0, 1, 1, 1]
function roundSeedOrderNew(contestantsPerChild: number, numberOfChildren: number): number[] {
  return Array.from({ length: numberOfChildren }, (_, childPosition) =>
    Array.from({ length: contestantsPerChild }, () => childPosition))
    .flat()
}
