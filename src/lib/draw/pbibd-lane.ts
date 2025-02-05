import type { Athlete, FairnessMetrics } from '../../types'

interface WeightedAthlete {
  athlete: Athlete
  weight: number
}

interface AthleteEncounter {
  athleteId: number
  round: number
}

type FacingHistory = Map<number, AthleteEncounter[]>

export function createTournamentDraw(n: number, k: number, rounds: number) {
  // State
  const athletes: Athlete[] = []
  const facingHistory: Map<number, FacingHistory> = new Map()
  const laneHistory: Map<number, number[]> = new Map()

  // Configuration
  const DECAY_FACTOR = 0.7 // Adjustable: Higher = faster decay
  const BASE_WEIGHT = 1.0
  // const LANE_WEIGHT = 3

  const initialize = () => {
    for (let i = 0; i < n; i++) {
      const id = i + 1
      athletes.push({ id, facedCount: new Map() })

      // Initialize facing history
      const history: FacingHistory = new Map()
      athletes.forEach((other) => {
        if (id !== other.id) {
          history.set(other.id, [])
        }
      })
      facingHistory.set(id, history)
      laneHistory.set(id, Array.from({ length: n }).fill(0) as number[])
    }
  }

  const getTimeDecayedScore = (athlete: Athlete, opponent: Athlete, currentRound: number): number => {
    const history = facingHistory.get(athlete.id)?.get(opponent.id) || []

    if (history.length === 0)
      return BASE_WEIGHT

    // Calculate decayed penalty for each previous encounter
    const totalPenalty = history.reduce((penalty, encounter) => {
      const roundsSince = currentRound - encounter.round
      return penalty + DECAY_FACTOR ** roundsSince
    }, 0)

    // Convert penalty to a score (higher is better)
    return 1 / (totalPenalty + 1)
  }

  // const getLaneAssignmentScore = (athlete: Athlete, currentHeat: Athlete[], targetSize: number) => {
  //   const history = laneHistory.get(athlete.id)!
  //   const dist = gaussianWeightedSelection(targetSize, history, 5)
  //   return dist[currentHeat.length] * LANE_WEIGHT
  // }

  const getHeatScore = (athlete: Athlete, heat: Athlete[], currentRound: number, _targetSize: number): number => {
    if (heat.length === 0)
      return BASE_WEIGHT

    // Calculate average decayed score against all athletes in the heat
    const totalScore = heat.reduce((sum, heatAthlete) =>
      sum + getTimeDecayedScore(athlete, heatAthlete, currentRound), 0)
    // sum + getTimeDecayedScore(athlete, heatAthlete, currentRound) + getLaneAssignmentScore(athlete, heat, targetSize), 0)

    return totalScore / heat.length
  }

  const selectAthleteForHeat = (
    available: Athlete[],
    currentHeat: Athlete[],
    currentRound: number,
    targetSize: number,
  ): Athlete => {
    const weightedAthletes: WeightedAthlete[] = available.map(athlete => ({
      athlete,
      weight: getHeatScore(athlete, currentHeat, currentRound, targetSize),
    }))

    // Normalize weights to prevent extreme values
    const maxWeight = Math.max(...weightedAthletes.map(wa => wa.weight))
    weightedAthletes.forEach(wa => wa.weight = wa.weight / maxWeight)

    // Weighted random selection
    const totalWeight = weightedAthletes.reduce((sum, wa) => sum + wa.weight, 0)
    let random = Math.random() * totalWeight

    for (const wa of weightedAthletes) {
      random -= wa.weight
      if (random <= 0)
        return wa.athlete
    }

    return weightedAthletes[0].athlete
  }

  const calculateHeatSizes = (totalAthletes: number): number[] => {
    const baseHeatSize = k
    const numFullHeats = Math.floor(totalAthletes / baseHeatSize)
    const remainder = totalAthletes % baseHeatSize

    if (remainder === 0) {
      return Array.from({ length: numFullHeats }).map(() => baseHeatSize)
    }

    const numHeatsNeeded = Math.ceil(totalAthletes / (baseHeatSize + 1))
    const heatSizes: number[] = []

    let remainingAthletes = totalAthletes
    for (let i = 0; i < numHeatsNeeded; i++) {
      const remainingHeats = numHeatsNeeded - i
      const idealSizeForThisHeat = Math.ceil(remainingAthletes / remainingHeats)
      const heatSize = Math.min(baseHeatSize + 1, idealSizeForThisHeat)
      heatSizes.push(heatSize)
      remainingAthletes -= heatSize
    }

    return heatSizes.sort((a, b) => b - a)
  }

  const updateFacingHistory = (round: Athlete[][], currentRound: number): void => {
    round.forEach((heat) => {
      for (let i = 0; i < heat.length; i++) {
        for (let j = i + 1; j < heat.length; j++) {
          // Update traditional facing count
          const count1 = heat[i].facedCount.get(heat[j].id) || 0
          const count2 = heat[j].facedCount.get(heat[i].id) || 0
          heat[i].facedCount.set(heat[j].id, count1 + 1)
          heat[j].facedCount.set(heat[i].id, count2 + 1)

          // Update facing history with round information
          const history1 = facingHistory.get(heat[i].id)?.get(heat[j].id)
          const history2 = facingHistory.get(heat[j].id)?.get(heat[i].id)

          if (history1 && history2) {
            history1.push({ athleteId: heat[j].id, round: currentRound })
            history2.push({ athleteId: heat[i].id, round: currentRound })
          }
        }
      }
    })
  }

  const generateRound = (currentRound: number): Athlete[][] => {
    const availableAthletes = [...athletes]
    const heats: Athlete[][] = []
    const heatSizes = calculateHeatSizes(athletes.length)

    for (const targetSize of heatSizes) {
      const currentHeat: Athlete[] = []
      while (currentHeat.length < targetSize && availableAthletes.length > 0) {
        const selected = selectAthleteForHeat(availableAthletes, currentHeat, currentRound, targetSize)
        const laneHistorySelected = laneHistory.get(selected.id)!
        laneHistorySelected[currentHeat.length]++

        currentHeat.push(selected)
        availableAthletes.splice(
          availableAthletes.findIndex(a => a.id === selected.id),
          1,
        )
      }
      heats.push(currentHeat)
    }

    const missingAthlete = athletes.find(ath => !heats.flat().find(h => h.id === ath.id))
    if (missingAthlete) {
      console.warn(`Athlete ${missingAthlete.id} not in round`)
    }

    return heats
  }

  const generateTournament = (): Athlete[][][] => {
    initialize()
    const tournament: Athlete[][][] = []

    for (let round = 0; round < rounds; round++) {
      const roundDraw = generateRound(round)
      updateFacingHistory(roundDraw, round)
      tournament.push(roundDraw)
    }

    return tournament
  }

  const getFairnessMetrics = (): FairnessMetrics => {
    const facings: number[] = []
    athletes.forEach((athlete) => {
      athlete.facedCount.forEach((count) => {
        facings.push(count)
      })
    })

    const v = athletes.length
    const expectedMeetings = (rounds * k * (k - 1)) / (v * (v - 1))
    const variance = facings.reduce((sum, val) =>
      sum + (val - expectedMeetings) ** 2, 0) / facings.length
    const theoreticalVarianceBound
      = ((rounds * k * (k - 1)) / (v * (v - 1))) * (1 - k / v)

    const maxFacings = Math.max(...facings)
    const minFacings = Math.min(...facings)

    return {
      variance,
      maxFacings,
      minFacings,
      maxFacingsCount: facings.filter(count => count === maxFacings).length,
      minFacingsCount: facings.filter(count => count === minFacings).length,
      theoreticalVarianceBound,
    }
  }

  return {
    generateTournament,
    getFairnessMetrics,
  }
}

export function gaussianWeightedSelection(n: number, p: number[], sigma: number = 1.0): number[] {
  /**
   * Generate a Gaussian distribution of probabilities for the next selected index,
   * weighted towards indexes far away from previously selected indexes.
   *
   * Parameters:
   * - n: number, length of the array.
   * - p: number[], array of previously selected indexes.
   * - sigma: number, standard deviation of the Gaussian distribution.
   *
   * Returns:
   * - probabilities: number[], probabilities for each index.
   */

  // Initialize an array to store the minimum distances
  const distances: number[] = Array.from({ length: n }).fill(Infinity) as number[]

  // Calculate the minimum distance to any previously selected index
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (p[j] >= 1) {
        // 1 / abs distance ** 0.5 adds more weight to repeated asignments.
        distances[i] = Math.min(distances[i], 1 / (Math.abs(j - i) ** 0.5))
        // console.log(`Change distance ${i} to ${distances[i]} (abs ${Math.abs(j - i)}) (driect? ${d})`)
        // console.log(i, distances[i])
      }
    }
  }

  // Create a Gaussian distribution based on the distances
  const probabilities: number[] = distances.map(d => Math.exp(-0.5 * ((d === Infinity ? 0 : d) / sigma) ** 2))

  // Normalize the probabilities to sum to 1
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0)
  const normalizedProbabilities = probabilities.map(prob => prob / sum)

  return normalizedProbabilities
}

export function rotateAthletes(rounds: number[][][]): number[][][] {
  let best: [number, number[][][]] = [Infinity, rounds]

  for (let r = 0; r < rounds.length; r++) {
    for (let h = 0; h <= rounds[0].length; h++) {
      for (let a = 0; a <= rounds[0][0].length; a++) {
        const [metric, draw] = _rotateAthletes(rounds, r, h, a)
        if (metric < best[0]) {
          best = [metric, draw]
        }
      }
    }
  }

  console.log(best[0])
  return best[1]
}

export function _rotateAthletes(_rounds: number[][][], rBy = 0, hBy = 0, aBy = 0): [number, number[][][]] {
  const rounds = cycleArray(_rounds, rBy)
  const athletes = Array.from(new Set(rounds.flat(Infinity))) as number[]

  // each athlete has an array that stores the count of 'usages' of a lane
  const history = new Map<number, number[]>(athletes.map(athlete => ([athlete, []])))

  const shuffled = rounds.map((_round, r_i) => {
    const round = cycleArray(_round, hBy + r_i - 1)
    if (r_i === 0) {
      // Initialize lane history for the first round
      round.forEach(heat => heat.forEach((athlete, lane) => {
        history.set(athlete, Array.from({ length: heat.length }).map(i => i === lane ? 1 : 0))
      }))

      return round
    }

    return round.map((_heat, h_i) => {
      const heat = cycleArray(_heat, aBy + h_i)
      const newLanes: number[] = [...heat].fill(0)

      heat.forEach((athlete) => {
        const prevLanes = history.get(athlete)!
        while (prevLanes.length < newLanes.length)
          prevLanes.push(0)

        let min = Math.min(...prevLanes)
        min = min === Infinity ? 0 : min

        let position = -1
        let tries = 0
        while (position === -1 && tries < 100) {
          tries++
          const nextLane = prevLanes.findIndex((l, l_i) => {
            if (tries > 99)
              console.log({ athlete, l, l_i, prevLanes, newLanes, min, tries })
            return l <= min && newLanes[l_i] === 0
          })
          if (nextLane === -1) {
            min++
          }
          else {
            position = nextLane
          }
        }

        newLanes[position] = athlete
        prevLanes[position] = (prevLanes[position] || 0) + 1
      })
      return newLanes
    })
  })

  const metric = Array.from(history.values()).map(lanes => lanes.reduce((sum, count) => sum + count ** 2, 0)).reduce((acc, val) => acc + val, 0)
  // console.log(metric, Array.from(history.values()))

  return [metric, shuffled]
}

function cycleArray<T>(arr: T[], by: number): T[] {
  const step = by % arr.length
  return [...arr.slice(step), ...arr.slice(0, step)]
}
