import type { Contest, DrawGenerator } from '@/lib/draw/types'
import type { Athlete } from '@/types'
import Rand from 'rand-seed'

interface MeasuredAthlete {
  id: number
  facedCount: Map<number, number>
}

interface Matchup {
  id: number
  round: number
}

type MatchupsMap = Map<number, Matchup[]>

// Configuration
const DECAY_FACTOR = 0.7 // Adjustable: Higher = faster decay
const BASE_WEIGHT = 1.0

export const pbibdShuffle: DrawGenerator = (n, k, r) => {
  const athletes: Athlete[] = []
  const matchupHistory: Map<number, MatchupsMap> = new Map()
  const laneHistory: Map<number, number[]> = new Map()
  for (let i = 0; i < n; i++) {
    const id = i + 1
    athletes.push({ id, facedCount: new Map() })

    // Initialize facing history
    const history: MatchupsMap = new Map()
    athletes.forEach((other) => {
      if (id !== other.id) {
        history.set(other.id, [])
      }
    })
    matchupHistory.set(id, history)
    // overfill to handle imbalanced heat counts
    laneHistory.set(id, Array.from({ length: n }).fill(0) as number[])
  }

  const tournament: Contest = []

  for (let round = 0; round < r; round++) {
    const roundDraw = generateRound(round, athletes, k, laneHistory, matchupHistory)
    updateMatchupHistory(roundDraw, round, matchupHistory)
    const rawDraw = roundDraw.map(h => h.map(a => a.id))
    tournament.push(rawDraw)
  }

  return tournament
}

function generateRound(
  currentRound: number,
  athletes: MeasuredAthlete[],
  k: number,
  laneHistory: Map<number, number[]>,
  matchupHistory: Map<number, MatchupsMap>,
): MeasuredAthlete[][] {
  const availableAthletes = [...athletes]
  const heats: MeasuredAthlete[][] = []
  const heatSizes = calculateHeatSizes(athletes.length, k)

  for (const targetSize of heatSizes) {
    const currentHeat: MeasuredAthlete[] = []
    while (currentHeat.length < targetSize && availableAthletes.length > 0) {
      const selected = selectAthleteForHeat(availableAthletes, currentHeat, currentRound, matchupHistory)
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

// handles athlete overflow for when k is not a divisor of n
function calculateHeatSizes(n: number, k: number): number[] {
  const numFullHeats = Math.floor(n / k)

  if (n % k === 0) {
    return Array.from({ length: numFullHeats }).map(() => k)
  }

  const numHeatsNeeded = Math.ceil(n / (k + 1))
  const heatSizes: number[] = []

  let remainingAthletes = n
  for (let i = 0; i < numHeatsNeeded; i++) {
    const remainingHeats = numHeatsNeeded - i
    const idealSizeForThisHeat = Math.ceil(remainingAthletes / remainingHeats)
    const heatSize = Math.min(k + 1, idealSizeForThisHeat)
    heatSizes.push(heatSize)
    remainingAthletes -= heatSize
  }

  return heatSizes.sort((a, b) => b - a)
}

function selectAthleteForHeat(available: MeasuredAthlete[], currentHeat: MeasuredAthlete[], currentRound: number, matchupHistory: Map<number, MatchupsMap>): MeasuredAthlete {
  const weightedAthletes = available.map(athlete => ({
    athlete,
    weight: getHeatScore(athlete, currentHeat, currentRound, matchupHistory),
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

function getHeatScore(athlete: Athlete, heat: Athlete[], currentRound: number, matchupHistory: Map<number, MatchupsMap>): number {
  if (heat.length === 0)
    return BASE_WEIGHT

  // Calculate average decayed score against all athletes in the heat
  const totalScore = heat.reduce((sum, heatAthlete) =>
    sum + getTimeDecayedScore(athlete, heatAthlete, currentRound, matchupHistory), 0)

  return totalScore / heat.length
}

function getTimeDecayedScore(athlete: Athlete, opponent: Athlete, currentRound: number, matchupHistory: Map<number, MatchupsMap>): number {
  const history = matchupHistory.get(athlete.id)?.get(opponent.id) || []

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

function updateMatchupHistory(round: Athlete[][], currentRound: number, matchupHistory: Map<number, MatchupsMap>): void {
  round.forEach((heat) => {
    for (let i = 0; i < heat.length; i++) {
      for (let j = i + 1; j < heat.length; j++) {
        // Update traditional facing count
        const count1 = heat[i].facedCount.get(heat[j].id) || 0
        const count2 = heat[j].facedCount.get(heat[i].id) || 0
        heat[i].facedCount.set(heat[j].id, count1 + 1)
        heat[j].facedCount.set(heat[i].id, count2 + 1)

        // Update facing history with round information
        const history1 = matchupHistory.get(heat[i].id)?.get(heat[j].id)
        const history2 = matchupHistory.get(heat[j].id)?.get(heat[i].id)

        if (history1 && history2) {
          history1.push({ id: heat[j].id, round: currentRound })
          history2.push({ id: heat[i].id, round: currentRound })
        }
      }
    }
  })
}
