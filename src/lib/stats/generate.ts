import type { AlgoEntry, Algos } from '@/lib/algorithms'
import type { Division, DrawGenerator } from '../draw/types'
import type { DrawAnalysis } from './analyze'
import { algorithms } from '@/lib/algorithms'
import { analyzeDivision } from './analyze'
import { saveArtefact } from './save'

export interface SavedDraw { draw: Division, analysis: { matchups: DrawAnalysis['matchups'] }, parameters: Parameters<DrawGenerator> }
export type SavedSummary = SavedDraw['analysis'] & { count: number, optimal: number }

interface AnalysisConfig {
  maxAthletes: number
  maxHeatSize: number
  maxRounds: number
}
const defaultAnalysisConfig: AnalysisConfig = {
  maxAthletes: 50,
  maxHeatSize: 8,
  maxRounds: 5,
};

// Generate stats for all algos
(async () => generateSummaryStats())()

async function generateSummaryStats(algorithm?: keyof Algos, config: AnalysisConfig = defaultAnalysisConfig) {
  const selectedAlgos: AlgoEntry[] = algorithm && algorithm in algorithms
    ? [[algorithm, algorithms[algorithm]]]
    : Object.entries(algorithms) as AlgoEntry[]

  await Promise.all(
    selectedAlgos.map(algo => genAndSaveAlgoResults(algo, config)),
  )

  // await saveArtefact(summaries.map((summary, i) => ({...summary, algorithm: selectedAlgos[i][0]})), 'summary', `${config.maxAthletes}-${config.maxHeatSize}-${config.maxRounds}`, 'all')
}

async function genAndSaveAlgoResults([name, impl]: AlgoEntry, config: AnalysisConfig = defaultAnalysisConfig) {
  const draws: SavedDraw[] = []

  // Generate all draws
  for (let a = 2; a < config.maxAthletes; a++) {
    for (let h = 2; h < config.maxHeatSize; h++) {
      for (let r = 1; r < config.maxRounds; r++) {
        // if (a * (a - 1) / 2 < r)
        //   continue

        const division = impl(a, h, r)
        const analysis = analyzeDivision(division)
        draws.push({ draw: division, analysis, parameters: [a, h, r] })
      }
    }
  }

  const suboptimalRows = draws.filter(draw => draw.analysis.matchups.varianceChange !== 1 && draw.analysis.matchups.mean < 2)
  console.log(suboptimalRows.map(r => r.analysis.matchups.varianceChange))
  const initialSummary = { count: 0, optimal: 0, matchups: { mean: 0, variance: 0, varianceMin: 0, varianceChange: 0, min: 0, max: 0 } }
  // Create summary statistics averaged across all draws (TODO: check outliers)

  const summary = suboptimalRows.reduce((summary, draw) => {
    // console.log(draw.analysis.matchups.varianceChange)
    summary.matchups.mean += draw.analysis.matchups.mean
    summary.matchups.variance += draw.analysis.matchups.variance
    summary.matchups.varianceMin += draw.analysis.matchups.varianceMin
    summary.matchups.varianceChange += draw.analysis.matchups.varianceChange
    summary.matchups.min += draw.analysis.matchups.min
    summary.matchups.max += draw.analysis.matchups.max
    return summary
  }, initialSummary)

  summary.count = suboptimalRows.length
  summary.matchups.mean /= suboptimalRows.length
  summary.matchups.variance /= suboptimalRows.length
  summary.matchups.varianceMin /= suboptimalRows.length
  summary.matchups.varianceChange /= suboptimalRows.length
  summary.matchups.min /= suboptimalRows.length
  summary.matchups.max /= suboptimalRows.length
  summary.optimal = draws.length - suboptimalRows.length

  await saveArtefact(summary, 'summary', `${config.maxAthletes}-${config.maxHeatSize}-${config.maxRounds}`, name)

  // Each draw takes ~7MB with default params
  await saveArtefact(draws, 'draws', `${config.maxAthletes}-${config.maxHeatSize}-${config.maxRounds}`, name)
  return summary
}
