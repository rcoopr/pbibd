type Group = number[]
type Round = Group[]

export function generateDiverseGroups(n: number, k: number, r: number): Round[] {
  // Input validation
  if (n < 1)
    throw new Error('n must be positive')
  if (k < 1)
    throw new Error('k must be positive')
  if (r < 1)
    throw new Error('r must be positive')
  // if (k > n) throw new Error("k cannot be larger than n");

  // Helper function to rotate array by offset
  function rotateArray(arr: number[], offset: number): number[] {
    const rotation = offset % arr.length
    return [...arr.slice(rotation), ...arr.slice(0, rotation)]
  }

  const rounds: Round[] = []

  // Create base array of numbers
  const numbers = Array.from({ length: n }, (_, i) => i + 1)

  // Generate rounds using different rotations
  for (let roundIndex = 0; roundIndex < r; roundIndex++) {
    const currentRound: Group[] = []

    // Use a different rotation for each round
    // We multiply by prime numbers to get better distribution
    const rotatedNumbers = rotateArray(numbers, roundIndex * 3)

    // Create groups
    let remaining = [...rotatedNumbers]
    while (remaining.length > 0) {
      const groupSize = Math.min(k, remaining.length)

      // For odd-sized remainder, distribute more evenly
      if (remaining.length < k + 2 && remaining.length > k) {
        const group1 = remaining.slice(0, Math.ceil(remaining.length / 2))
        const group2 = remaining.slice(Math.ceil(remaining.length / 2))
        currentRound.push(group1, group2)
        break
      }

      const group = remaining.slice(0, groupSize)
      currentRound.push(group)
      remaining = remaining.slice(groupSize)
    }

    rounds.push(currentRound)

    // For every other round, reverse the number order to increase diversity
    if (roundIndex % 2 === 1) {
      numbers.reverse()
    }
  }

  return rounds
}

// Helper function to calculate diversity metrics
export function calculateDiversityMetrics(rounds: Round[]): {
  maxPairRepetitions: number
  avgPairRepetitions: number
  totalPairs: number
  pairDistribution: Record<number, number>
  singletonGroups: number
} {
  const pairCounts = new Map<string, number>()
  let singletonGroups = 0

  // Count all pair occurrences and singleton groups
  for (const round of rounds) {
    for (const group of round) {
      if (group.length === 1) {
        singletonGroups++
      }
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const pair = `${group[i]},${group[j]}`
          pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1)
        }
      }
    }
  }

  const counts = Array.from(pairCounts.values())

  // Calculate distribution of pair frequencies
  const distribution: Record<number, number> = {}
  counts.forEach((count) => {
    distribution[count] = (distribution[count] || 0) + 1
  })

  return {
    maxPairRepetitions: Math.max(...counts),
    avgPairRepetitions: counts.reduce((a, b) => a + b, 0) / counts.length,
    totalPairs: counts.length,
    pairDistribution: distribution,
    singletonGroups,
  }
}
