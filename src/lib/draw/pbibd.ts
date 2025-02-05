import type { Athlete, FairnessMetrics } from '../../types'
import Rand from 'rand-seed'

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

  // Configuration
  const DECAY_FACTOR = 0.7 // Adjustable: Higher = faster decay
  const BASE_WEIGHT = 1.0

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

  const getHeatScore = (athlete: Athlete, heat: Athlete[], currentRound: number): number => {
    if (heat.length === 0)
      return BASE_WEIGHT

    // Calculate average decayed score against all athletes in the heat
    const totalScore = heat.reduce((sum, heatAthlete) =>
      sum + getTimeDecayedScore(athlete, heatAthlete, currentRound), 0)

    return totalScore / heat.length
  }

  const selectAthleteForHeat = (
    available: Athlete[],
    currentHeat: Athlete[],
    currentRound: number,
  ): Athlete => {
    const weightedAthletes: WeightedAthlete[] = available.map(athlete => ({
      athlete,
      weight: getHeatScore(athlete, currentHeat, currentRound),
    }))

    // Normalize weights to prevent extreme values
    const maxWeight = Math.max(...weightedAthletes.map(wa => wa.weight))
    weightedAthletes.forEach(wa => wa.weight = wa.weight / maxWeight)

    // Weighted random selection
    const totalWeight = weightedAthletes.reduce((sum, wa) => sum + wa.weight, 0)
    let random = new Rand('1234').next() * totalWeight

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
        const selected = selectAthleteForHeat(availableAthletes, currentHeat, currentRound)
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
