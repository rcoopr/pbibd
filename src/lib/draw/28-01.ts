type Group = number[]
type Round = Group[]

export function generateDiverseGroups(n: number, k: number, r: number): Round[] {

  //   throw new Error('k cannot be larger than n')

  // Generate a permutation using multiplicative group
  function generatePermutation(length: number, round: number): number[] {
    const result: number[] = []
    const used = new Set<number>()

    // Use different starting points for different rounds
    let start = (round % length) + 1
    result.push(start)
    used.add(start)

    // Add remaining numbers using a pattern based on the round number
    while (result.length < length) {
      const step = (round % (length - 1))
      let next = ((start + step) % length) + 1

      // If we've used this number, try the next one
      while (used.has(next)) {
        next = (next % length) + 1
      }

      result.push(next)
      used.add(next)
      start = next
    }

    return result
  }

  const rounds: Round[] = []

  // Generate r different rounds
  for (let roundIndex = 0; roundIndex < r; roundIndex++) {
    const currentRound: Group[] = []
    const permutation = generatePermutation(n, roundIndex)

    // Split permutation into groups of size k
    for (let i = 0; i < n; i += k) {
      const groupSize = Math.min(k, n - i)
      const group = permutation.slice(i, i + groupSize)

      currentRound.push(group)
    }

    if (currentRound[currentRound.length - 1].length === 1) {
      const temp = currentRound.pop()!
      currentRound[currentRound.length - 1].push(temp[0])
    }

    rounds.push(currentRound)
  }

  return rounds
}

// Helper function to calculate diversity metrics
export function calculateDiversityMetrics(rounds: Round[]): {
  maxPairRepetitions: number
  avgPairRepetitions: number
  totalPairs: number
  pairDistribution: Record<number, number>
} {
  const pairCounts = new Map<string, number>()

  // Count all pair occurrences
  for (const round of rounds) {
    for (const group of round) {
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
  }
}
