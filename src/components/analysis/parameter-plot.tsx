import type { UIAnalysisData } from '@/components/analysis/saved-analysis'
import type { SavedDraw } from '@/lib/stats/generate'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Plot from 'react-plotly.js'

export function ParameterPlots({ data, highlight }: { data: UIAnalysisData[], highlight?: string }) {
  const [inverse, setInverse] = useState(false)

  if (!data || data.length === 0)
    return null

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg p-6 w-full">
      <div className="flex gap-4 items-center">
        <button className="px-4 py-2 border rounded border-gray-200" onClick={() => setInverse(i => !i)}>Switch</button>

        <h2 className="font-bold text-lg">
          Parameter Plots: Showing
          {' '}
          {inverse ? 'Optimal' : 'Suboptimal'}
          {' '}
          Draws
        </h2>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {data.map(datum => <ParameterPlot key={datum.algorithm} title={datum.algorithm} draws={datum.draws} highlight={highlight === datum.algorithm} inverse={inverse} />)}
      </div>
    </div>
  )
}

function ParameterPlot({ title, draws, highlight, inverse }: { title: string, draws: SavedDraw[], highlight?: boolean, inverse?: boolean }) {
  if (draws.length === 0)
    return null

  const data = draws.filter(draw => inverse ? draw.analysis.matchups.varianceChange === 1 : draw.analysis.matchups.varianceChange !== 1)

  const data3D: Plotly.Data[] = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: data.map(r => r.parameters[0]),
      y: data.map(r => r.parameters[1]),
      z: data.map(r => r.parameters[2]),
      marker: {
        size: 3,
        color: data.map(r => r.analysis.matchups.varianceChange),
        colorscale: 'Viridis',
      },
    },
  ]

  return (
    <div className={cn(highlight ? 'bg-blue-50 border-blue-400 border' : 'bg-white', 'p-4 rounded-lg shadow')}>
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <Plot
        data={data3D}
        layout={{
          margin: { l: 0, r: 0, b: 0, t: 0 },
          scene: {
            xaxis: { title: 'Athletes' },
            yaxis: { title: 'Heat Size' },
            zaxis: { title: 'Rounds' },
          },
          autosize: true,
          height: 400,
          width: 400,
        }}
        useResizeHandler
        className="w-full"
      />
    </div>
  )
}
