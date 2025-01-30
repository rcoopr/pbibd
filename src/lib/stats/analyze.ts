import type { Division } from '../draw/types'
import { findMaxBy } from '../utils'
import { distributeSum } from './utils'

interface Matchup {
  pair: [number, number]
  count: number
}

interface HeatSizeStats {
  mode: number
  distribution: number[]
}

// interface MatchupStats {
//   map: Map<string, number>
//   maxMatchups: number
//   minMatchups: number
//   averageMatchups: number
//   neverMeetPairs: Array<[number, number]>
//   frequentMeetPairs: Array<Matchup>
//   theoreticalAvg: number
//   // matchupCountTable: number[]
// }

export interface DrawAnalysis {
  // _matchups: MatchupStats
  matchups: {
    mean: number
    variance: number
    varianceMin: number
    varianceChange: number
    min: number
    max: number
    matrix: number[]
  }
  heats: HeatSizeStats
}

export function analyzeDivision(division: Division): DrawAnalysis {
  const sizes = new Map<number, number>()
  const matchups = new Map<string, number>()

  // Helper to create consistent key for athlete pairs
  const getPairKey = (a1: number, a2: number): string => {
    return [a1, a2].sort((a, b) => a - b).join('-')
  }

  // Count all matchups across the tournament
  division.forEach((round) => {
    round.forEach((heat) => {
      const size = heat.length
      sizes.set(size, (sizes.get(size) || 0) + 1)

      // Count each pair in the heat
      for (let i = 0; i < heat.length; i++) {
        // i + 1 to avoid counting the pair with itself
        for (let j = i + 1; j < heat.length; j++) {
          const key = getPairKey(heat[i], heat[j])
          matchups.set(key, (matchups.get(key) || 0) + 1)
        }
      }
    })
  })

  // Calculate basic statistics
  const matchupCounts = Array.from(matchups.values())
  // const maxMatchups = Math.max(...matchupCounts)
  // const minMatchups = Math.min(...matchupCounts)
  const averageMatchups = matchupCounts.reduce((a, b) => a + b, 0) / matchupCounts.length

  // Find pairs that never meet
  const neverMeetPairs: Array<[number, number]> = []
  const allAthletes = new Set<number>()
  division.forEach((round) => {
    round.forEach((heat) => {
      heat.forEach(athlete => allAthletes.add(athlete))
    })
  })

  // Check all possible pairs
  const athletesList = Array.from(allAthletes).sort((a, b) => a - b)

  for (let i = 0; i < athletesList.length; i++) {
    for (let j = i + 1; j < athletesList.length; j++) {
      const key = getPairKey(athletesList[i], athletesList[j])
      if (!matchups.has(key)) {
        neverMeetPairs.push([athletesList[i], athletesList[j]])
      }
    }
  }

  // Find frequently matchup pairs
  const frequentMeetPairs: Array<Matchup> = []
  matchups.forEach((count, key) => {
    if (count > averageMatchups * 1.2) { // 20% more than average as threshold
      const [a1, a2] = key.split('-').map(Number)
      frequentMeetPairs.push({
        pair: [a1, a2],
        count,
      })
    }
  })

  const heatSizes = Array.from(sizes.entries())
  const modalHeatSize = findMaxBy(heatSizes, ([_size, count]) => count)
  const heatSizeDistribution = heatSizes.flatMap(([size, count]) => Array.from({ length: count }).fill(size) as number[])

  // const theoreticalAvgMatchups = 1

  const matchupCountTable: number[] = []
  for (let i = 0; i < athletesList.length - 1; i++) {
    for (let j = i + 1; j < athletesList.length; j++) {
      const key = getPairKey(athletesList[i], athletesList[j])
      matchupCountTable.push(matchups.get(key) || 0)
    }
  }
  const totalMatchups = matchupCountTable.reduce((a, b) => a + b, 0)
  const evenDistribution = distributeSum(matchupCountTable.length, totalMatchups)

  const mean = totalMatchups / matchupCountTable.length
  const variance = matchupCountTable.reduce((a, b) => a + b ** 2, 0) / matchupCountTable.length / mean
  const varianceMin = evenDistribution.reduce((a, b) => a + b ** 2, 0) / evenDistribution.length / mean

  return {
    // _matchups: {
    //   map: matchups,
    //   maxMatchups,
    //   minMatchups,
    //   averageMatchups,
    //   neverMeetPairs,
    //   frequentMeetPairs,
    //   theoreticalAvg: theoreticalAvgMatchups,
    //   // matchupCountTable,
    // },
    matchups: {
      mean,
      variance,
      varianceMin,
      varianceChange: (variance / varianceMin),
      min: Math.min(...matchupCountTable),
      max: Math.max(...matchupCountTable),
      matrix: matchupCountTable,
    },
    heats: {
      mode: modalHeatSize[0],
      distribution: heatSizeDistribution,
    },
  }
}
