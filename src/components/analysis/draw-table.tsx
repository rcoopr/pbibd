import type { fernando } from '@/lib/draw/fernando'
import type { Contest } from '@/lib/draw/types'
import type { DrawAnalysis } from '@/lib/stats/analyze'
import type { SavedDraw } from '@/lib/stats/generate'
import { MatchupMatrix } from '@/components/analysis/matchup-matrix'
import { cn } from '@/lib/utils'
import ChevronLeft from 'lucide-react/icons/chevron-left'
import ChevronRight from 'lucide-react/icons/chevron-right'
import Search from 'lucide-react/icons/search'
import { useState } from 'react'
import Plot from 'react-plotly.js'

const MAX_ROWS = 20
export interface NewAnalysis { draw: Contest, analysis: DrawAnalysis, parameters: Parameters<typeof fernando> }

const fmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

function Th({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <th className={cn('px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider first:border-l-0 border-l border-gray-200', className)}>
      {children}
    </th>
  )
}

function Td({ children, className, ...props }: { children: React.ReactNode } & React.HTMLProps<HTMLTableCellElement>) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 first:border-l-0 border-l border-gray-200', className)} {...props}>
      {children}
    </td>
  )
}

export function AnalysisTable({ data }: { data: SavedDraw[] }) {
  const [page, setPage] = useState(1)
  const [athleteSearch, setAthleteSearch] = useState<number | undefined>(undefined)
  const [heatSearch, setHeatSearch] = useState<number | undefined>(undefined)
  const [roundSearch, setRoundSearch] = useState<number | undefined>(undefined)
  const [hideOptimal, setHideOptimal] = useState(false)

  const filteredData = data.filter((a) => {
    const byAth = athleteSearch ? a.parameters[0] === athleteSearch : true
    const byHeat = heatSearch ? a.parameters[1] === heatSearch : true
    const byRound = roundSearch ? a.parameters[2] === roundSearch : true
    const byOptimal = hideOptimal ? a.analysis.matchups.varianceChange !== 1 : true
    return byAth && byHeat && byRound && byOptimal
  }).sort((a, b) => (b.analysis.lanes.asnSumSqAvg / b.analysis.lanes.asnSumSqBest) - (a.analysis.lanes.asnSumSqAvg / a.analysis.lanes.asnSumSqBest))

  const viewedAnalysis = filteredData.slice((page - 1) * MAX_ROWS, page * MAX_ROWS)
  const maxPages = Math.ceil(filteredData.length / MAX_ROWS)

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Results Summary */}
        <div className="flex items-center gap-8 flex-wrap mt-2 p-2 bg-white border border-gray-200 rounded-lg">
          <label className="inline-flex items-center px-4 cursor-pointer mr-auto">
            <input
              type="checkbox"
              checked={hideOptimal}
              onChange={e => setHideOptimal(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">Hide optimal rows</span>
          </label>

          <p className="text-sm text-gray-500">
            {'Showing '}
            {filteredData.length > 0 && (
              <>
                <span className="font-bold text-gray-700">{((page - 1) * MAX_ROWS) + 1}</span>
                {' to '}
                <span className="font-bold text-gray-700">
                  {Math.min(page * MAX_ROWS, filteredData.length)}
                </span>
                {' of '}
              </>
            )}
            <span className="font-bold text-gray-700">{filteredData.length}</span>
            {' results'}
          </p>

          {/* Page Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={maxPages}
                value={page}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (value >= 1 && value <= maxPages) {
                    setPage(value)
                  }
                }}
                className="w-16 p-2 text-center border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">
                {' of '}
                <span className="font-bold text-gray-700">
                  {maxPages || 1}
                </span>
              </span>
            </div>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, maxPages))}
              disabled={page === maxPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Filters */}
        <div className="flex-1 grid grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              min={2}
              max={50}
              type="number"
              value={athleteSearch}
              onChange={e => setAthleteSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}
              placeholder="Filter Athletes"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <input
              min={2}
              max={8}
              type="number"
              value={heatSearch}
              onChange={e => setHeatSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}
              placeholder="Filter Heats"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <input
              min={2}
              max={5}
              type="number"
              value={roundSearch}
              onChange={e => setRoundSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}
              placeholder="Filter Rounds"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto mb-16">
        <table className="min-w-full divide-y divide-gray-200 max-w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <Th>Athletes</Th>
              <Th>Heat Size</Th>
              <Th>Rounds</Th>
              <Th className="lowercase">
                σ
                <sup>2</sup>
              </Th>
              <Th className="lowercase">
                σ
                <sup>2</sup>
                <sub className="uppercase">min</sub>
              </Th>
              <Th className="lowercase">
                σ
                <sup>2</sup>
                <sub className="uppercase">diff</sub>
              </Th>
              <Th>
                Missing
                <br />
                MX
              </Th>
              <Th>
                Missing
                <br />
                MX
                <sub>MIN</sub>
              </Th>
              <Th>
                Total
                <br />
                MX
              </Th>
              <Th>
                Unique
                <br />
                MX
              </Th>
              <Th>
                Avg
                <br />
                MX
              </Th>
              <Th>
                Distribution
                <br />
                MX
              </Th>
              <Th>Lane Asn</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {viewedAnalysis.length === 0 && <tr><Td colSpan={13} className="bg-white text-center italic text-gray-400">No results found</Td></tr>}

            {viewedAnalysis.map((row, rowIndex) => (
              <Row {...row} key={`${rowIndex}-${page}`} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

const colorMapPlasma10 = ['#000', '#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'].reverse()
function Row({ analysis, parameters, draw }: SavedDraw) {
  const [showDraw, setShowDraw] = useState(false)

  const pctDiff = analysis.matchups.varianceChange // analysis.counts.variance / analysis.counts.varianceMin
  const index = Math.floor((pctDiff - 1) * 10)
  const color = colorMapPlasma10[Math.min(index, colorMapPlasma10.length - 1)]

  const plot: Plotly.Data[] = [
    {
      type: 'box',
      boxmean: 'sd',
      x: analysis.matchups.matrix,
      marker: { color: '#7BB3FA' },
      jitter: 1,
    },
  ]

  return (
    <>
      <tr onClick={() => setShowDraw(s => !s)} className="cursor-pointer transition-colors duration-150 ease-in-out odd:bg-white odd:hover:bg-gray-50 even:bg-gray-50 even:hover:bg-gray-100">
        <Td>{parameters[0]}</Td>
        <Td>{parameters[1]}</Td>
        <Td>{parameters[2]}</Td>
        <Td>{fmt.format(analysis.matchups.variance)}</Td>
        <Td>{fmt.format(analysis.matchups.varianceMin)}</Td>
        <Td style={{ color: index > 4 ? 'white' : 'black', background: color }}>{fmt.format(analysis.matchups.varianceChange)}</Td>
        <Td>{fmt.format(analysis.matchups.minMXCount)}</Td>
        <Td>{fmt.format(analysis.matchups.bestMinMXCount)}</Td>
        <Td>{analysis.matchups.count}</Td>
        <Td>{analysis.matchups.matrix.length}</Td>
        <Td>{fmt.format(analysis.matchups.mean)}</Td>
        <Td className="p-2">
          <Plot
            config={{ staticPlot: true, setBackground: (_gd, col) => col === 'rgb(0, 0, 0)' ? 'transparent' : col }}
            data={plot}
            layout={{
              margin: { l: 0, r: 0, b: 0, t: 0 },
              xaxis: { visible: false },
              height: 50,
              width: 200,
              showlegend: false,
            }}
          />
        </Td>
        <Td>
          {fmt.format(analysis.lanes.asnSumSqAvg / analysis.lanes.asnSumSqBest)}
        </Td>
      </tr>

      {showDraw && (
        <tr>
          <Td colSpan={13}>
            <div className="flex items-start justify-around gap-6 col-span-full py-4 overflow-x-aut">
              <PPDraw draw={draw} />
              <MatchupMatrix data={analysis.matchups.matrix} />
            </div>
          </Td>
        </tr>
      )}
    </>
  )
}

function PPDraw({ draw }: { draw: Contest }) {
  return (
    <div className="flex flex-col">
      <p className="uppercase font-semibold text-gray-500 tracking-widest">Full Division Draw</p>
      <pre className="text-left p-2 whitespace-pre-line">
        <p>[</p>
        {draw.map((round, i) => <p key={i} className="ml-4 py-1">{JSON.stringify(round)}</p>)}
        <p>]</p>
      </pre>
    </div>
  )
}
