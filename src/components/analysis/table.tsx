import type { TournamentAnalysis } from '@/lib/claude-analyze'
import type { fernando } from '@/lib/draw/fernando'
import type { Division } from '@/lib/draw/types'
import type { SavedDraw } from '@/lib/stats/generate'
import { MatchupMatrix } from '@/components/matchup-matrix'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export interface NewAnalysis { draw: Division, analysis: TournamentAnalysis, parameters: Parameters<typeof fernando> }

const fmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

const maxRows = 50
export function AnalysisTable({ data }: { data: SavedDraw[] }) {
  const [page, setPage] = useState(1)
  // let analysisData = data
  // if (!data) {
  //   analysisData = performAnalysis.read()
  //   analysisData = analysisData.filter(a => a.analysis.counts.mean < 2 && a.analysis.counts.variance > a.analysis.counts.varianceMin)
  // }
  const filteredData = data.filter(a => a.analysis.matchups.varianceChange > 1).sort((a, b) => b.analysis.matchups.varianceChange - a.analysis.matchups.varianceChange)
  const viewedAnalysis = filteredData.slice((page - 1) * maxRows, (page) * maxRows)
  const maxPages = Math.ceil(filteredData.length / maxRows)


  return (
    <div className="grid grid-cols-[repeat(10,1fr)] text-center font-mono w-full">
      <div className="col-span-full text-center sticky top-0 bg-white grid grid-cols-[repeat(10,1fr)] font-bold text-lg py-4 border-b-2 border-zinc-600">
        <div>Athletes</div>
        <div>Heat Size</div>
        <div>Rounds</div>
        <div>Min MX</div>
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
        <div className='flex gap-1 items-center justify-center'>
          <input min="1" max={maxPages} className='min-w-0 w-[8ch]' type="number" value={page} onChange={(e) => setPage(e.currentTarget.valueAsNumber)}></input>
        </div>
      </div>

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
  const color = colorMapPlasma10[index]

  return (
    <>
      <div className={highlight ? 'bg-red-100' : ''}>{parameters[0]}</div>
      <div>{parameters[1]}</div>
      <div>{parameters[2]}</div>
      <div>{analysis.matchups.min}</div>
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

function PPDraw({draw}: {draw: Division}) {
  return <pre className='text-left p-2 whitespace-pre-line'>
    <p>[</p>
    {draw.map((round, i) => <p key={i} className='ml-4'>{JSON.stringify(round)}</p>)}
    <p>]</p>
  </pre>
}
