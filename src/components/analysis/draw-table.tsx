import type { TournamentAnalysis } from '@/lib/claude-analyze'
import type { fernando } from '@/lib/draw/fernando'
import type { Division } from '@/lib/draw/types'
import type { SavedDraw } from '@/lib/stats/generate'
import { MatchupMatrix } from '@/components/matchup-matrix'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const MAX_ROWS = 20
export interface NewAnalysis { draw: Division, analysis: TournamentAnalysis, parameters: Parameters<typeof fernando> }

const fmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

export function AnalysisTable({ data }: { data: SavedDraw[] }) {
  const [page, setPage] = useState(1)
  const [athleteSearch, setAthleteSearch] = useState<number | undefined>(undefined)
  const [heatSearch, setHeatSearch] = useState<number | undefined>(undefined)
  const [roundSearch, setRoundSearch] = useState<number | undefined>(undefined)
  const [hideOptimal, setHideOptimal] = useState(false)
  // let analysisData = data
  // if (!data) {
  //   analysisData = performAnalysis.read()
  //   analysisData = analysisData.filter(a => a.analysis.counts.mean < 2 && a.analysis.counts.variance > a.analysis.counts.varianceMin)
  // }
  const filteredData = data.filter(a => {
    const byAth = athleteSearch ? a.parameters[0] === athleteSearch : true
    const byHeat = heatSearch ? a.parameters[1] === heatSearch : true
    const byRound = roundSearch ? a.parameters[2] === roundSearch : true
    const byOptimal = hideOptimal ? a.analysis.matchups.varianceChange !== 1 : true
    return byAth && byHeat && byRound && byOptimal
  }).sort((a, b) => b.analysis.matchups.varianceChange - a.analysis.matchups.varianceChange)
  const viewedAnalysis = filteredData.slice((page - 1) * MAX_ROWS, (page) * MAX_ROWS)
  const maxPages = Math.ceil(filteredData.length / MAX_ROWS)

  return (
    <div className="grid grid-cols-[repeat(10,1fr)] text-center font-mono w-full">
      <div className="col-span-full text-center sticky top-0 bg-white grid grid-cols-[repeat(6,1fr)] gap-4 font-bold text-lg py-4">
        <label className='flex flex-col text-sm text-left text-gray-600 font-thin'>Athletes<input min={2} max={50} type='number' value={athleteSearch} onChange={e => setAthleteSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}></input></label>
        <label className='flex flex-col text-sm text-left text-gray-600 font-thin'>Heat Size<input min={2} max={8} type='number' value={heatSearch} onChange={e => setHeatSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}></input></label>
        <label className='flex flex-col text-sm text-left text-gray-600 font-thin'>Rounds<input min={2} max={5} type='number' value={roundSearch} onChange={e => setRoundSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}></input></label>
        <label className='flex flex-col items-center gap-2 text-sm text-left text-gray-600 font-thin'>Hide Optimal<input type='checkbox' checked={hideOptimal} onChange={e => setHideOptimal(e.currentTarget.checked)}></input></label>
        
        <label className='flex flex-col text-sm text-left text-gray-600 font-thin'>Rounds<input min={2} max={5} type='number' value={roundSearch} onChange={e => setRoundSearch(Number.isNaN(e.currentTarget.valueAsNumber) ? undefined : e.currentTarget.valueAsNumber)}></input></label>
        
        {/* {Array.from({length: 7}).map((_, i) => <div key={i}></div>)} */}
      </div>

      <div className="col-span-full text-center items-center sticky top-0 bg-white grid grid-cols-[repeat(10,1fr)] font-bold text-lg py-4 border-b-2 border-zinc-600">
        <div>Athletes</div>
        <div>Heat Size</div>
        <div>Rounds</div>
        <div>Min MX %</div>
        <div>Max MX</div>
        <div>x̄</div>
        <div>
          σ
          <sup>2</sup>
        </div>
        <div>
          σ
          <sup>2</sup>
          <sub>min</sub>
        </div>
        <div>
          σ
          <sup>2</sup>
          <sub>pct</sub>
        </div>
        <div className="flex gap-1 items-center justify-center">
          <div className='flex flex-col text-sm font-normal text-gray-600'>
          <div>Page</div>
          <input min="1" max={maxPages} className="min-w-0 w-[8ch]" type="number" value={page} onChange={e => setPage(e.currentTarget.valueAsNumber)}></input>
         <div>of {maxPages}</div>
          </div>
        </div>
      </div>

      {viewedAnalysis.length === 0 && <div className='text-center col-span-full p-8 italic'>No results found</div>}

      {viewedAnalysis.map((newAnalysis, i) => {
        if (i > 1000)
          return null

        return (
          <Row key={i} {...newAnalysis} />
        )
      })}
    </div>
  )
}

const colorMapPlasma10 = ['#000', '#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'].reverse()
function Row({ analysis, parameters, draw }: SavedDraw) {
  // const avgPerRound = analysis.matchups.averageMatchups / parameters[2]
  const highlight = false // avgPerRound !== 1
  const [showDraw, setShowDraw] = useState(false)

  const pctDiff = analysis.matchups.varianceChange // analysis.counts.variance / analysis.counts.varianceMin
  const index = Math.floor((pctDiff - 1) * 10)
  const color = colorMapPlasma10[Math.min(index, colorMapPlasma10.length - 1)]

  return (
    <>
      <div className={highlight ? 'bg-red-100' : ''}>{parameters[0]}</div>
      <div>{parameters[1]}</div>
      <div>{parameters[2]}</div>
      <div>{(100*analysis.matchups.min).toFixed(1)}%</div>
      <div>{analysis.matchups.max}</div>
      <div className="grid grid-cols-2">
        <div className="text-right">
          {Math.floor(analysis.matchups.mean)}
          .
        </div>

        <div className="text-left">
          {fmt.format(analysis.matchups.mean % 1).replace('0.', '')}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="text-right">
          {Math.floor(analysis.matchups.variance)}
          .
        </div>

        <div className="text-left">
          {fmt.format(analysis.matchups.variance % 1).replace('0.', '')}
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="text-right">
          {Math.floor(analysis.matchups.varianceMin)}
          .
        </div>

        <div className="text-left">
          {fmt.format(analysis.matchups.varianceMin % 1).replace('0.', '')}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ background: color, color: index > 5 ? 'white' : 'black' }}>
        <div className="text-right">
          {Math.floor(pctDiff)}
          .
        </div>

        <div className="text-left">
          {fmt.format(pctDiff % 1).replace('0.', '')}
        </div>
      </div>

      <button onClick={() => setShowDraw(s => !s)}>
        <span className={cn(showDraw ? '-rotate-90' : 'rotate-90', 'transition-transform inline-block')}>
          {'>'}
        </span>
      </button>

      <div className={cn(!showDraw && 'border-b border-zinc-300', 'col-span-full')} />

      {showDraw && (
        <div className="grid grid-cols-2 col-span-full border-b border-zinc-300 py-4 overflow-x-auto">
          <PPDraw draw={draw} />
          <MatchupMatrix data={analysis.matchups.matrix} />
        </div>
      )}
    </>
  )
}

function PPDraw({ draw }: { draw: Division }) {
  return (
    <pre className="text-left p-2 whitespace-pre-line">
      <p>[</p>
      {draw.map((round, i) => <p key={i} className="ml-4">{JSON.stringify(round)}</p>)}
      <p>]</p>
    </pre>
  )
}
