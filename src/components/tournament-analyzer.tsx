import { useState } from 'react';
import Plot from 'react-plotly.js';
import { DrawResult } from '../types';
import FacingVisualizer from './FacingVisualizer';
import { Activity, ArrowDownCircle, BarChart4 } from 'lucide-react';

export default function TournamentAnalyzer({
  draws,
  bestDrawByVariance,
  bestDrawByMaxFacingsCount,
}: {
  draws: DrawResult[],
  bestDrawByVariance: DrawResult | null,
  bestDrawByMaxFacingsCount: DrawResult | null,
}) {
  return (
      <div className="max-w-7xl mx-auto">
        {bestDrawByMaxFacingsCount && (
          <DrawStructure 
            draw={bestDrawByMaxFacingsCount}
            title="Best Draw Results by Max Matchups Count"
          />
        )}
        {bestDrawByVariance && (
          <DrawStructure 
            draw={bestDrawByVariance} 
            title="Best Draw Results by Variance" />
        )}

        {draws.length > 1 && (
          <div className="bg-white rounded-lg min-w-fit shadow p-6 mb-4">
            <div className="flex items-center mb-4">
              <BarChart4 className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Visualization</h2>
            </div>
            <Visualization draws={draws} />
          </div>
        )}
      </div>
  );
}

function DrawStructure({
  draw,
  title = 'Best Draw Results',
}: {
  draw: DrawResult;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((o) => !o);

  return (
    <div className="bg-white rounded-lg min-w-fit shadow p-6 mb-4">
      <div className="flex items-center">
        <Activity className="w-6 h-6 mr-2" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="mb-4 opacity-60 text-sm font-semibold">
        (Max/Min Matchups) show number of iterations with that count
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Variance</h3>
          <p className="text-2xl font-semibold">{draw.metrics.variance.toFixed(4)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">Max Matchups</h3>
          <p className="text-2xl font-semibold">
            {draw.metrics.maxFacings} ({(100 * draw.metrics.maxFacingsCount).toFixed(2)}%)
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">Min Matchups</h3>
          <p className="text-2xl font-semibold">
            {draw.metrics.minFacings} ({(100 * draw.metrics.minFacingsCount).toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Facing Visualization</h3>
        <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
          <FacingVisualizer athletes={draw.draw[0].flat()} maxFacings={draw.metrics.maxFacings} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Draw Structure</h3>
        <div
          className={`bg-gray-50 p-4 rounded-md relative overflow-hidden ${
            open ? 'h-auto' : 'h-14'
          }`}
        >
          <div className="absolute top-0 right-0 p-4">
            <ArrowDownCircle
              className={`w-6 h-6 text-gray-400 hover:text-gray-500 ${
                open ? 'rotate-180' : 'rotate-0'
              }`}
              onClick={toggleOpen}
            />
          </div>
          {draw.draw.map((round, roundIndex) => (
            <div key={roundIndex} className="mb-4">
              <h4 className="font-semibold text-lg mb-3">Round {roundIndex + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {round.map((heat, heatIndex) => (
                  <div key={heatIndex} className="bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600">Heat {heatIndex + 1}:</span>
                    <div className="text-sm">{heat.map((athlete) => athlete.id).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Visualization({ draws }: { draws: DrawResult[] }) {
  if (draws.length === 0) return null;

  const data3DitVarMax: Plotly.Data[] = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: draws.map((r) => r.iteration),
      y: draws.map((r) => r.metrics.variance),
      z: draws.map((r) => r.metrics.maxFacings),
      marker: {
        size: 3,
        color: draws.map((r) => r.metrics.variance),
        colorscale: 'Viridis',
      },
    },
  ];

  const data3DvarMaxMin: Plotly.Data[] = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: draws.map((r) => r.metrics.minFacings),
      y: draws.map((r) => r.metrics.variance),
      z: draws.map((r) => r.metrics.maxFacings),
      marker: {
        size: 3,
        color: draws.map((r) => r.metrics.variance),
        colorscale: 'Viridis',
      },
    },
  ];

  const data2D: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: draws.map((r) => r.metrics.variance),
      y: draws.map((r) => r.metrics.maxFacings),
      marker: {
        size: 5,
        color: draws.map((r) => r.metrics.variance),
        colorscale: 'Viridis',
      },
    },
  ];

  const facingsCounts = draws.reduce((counts, draw) => {
    counts[draw.metrics.maxFacings] = (counts[draw.metrics.maxFacings] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);

  const dataBar: Plotly.Data[] = [
    {
      type: 'bar',
      mode: 'markers',
      x: Object.keys(facingsCounts).map((k) => Number(k)),
      y: Object.keys(facingsCounts).map((k) => facingsCounts[Number(k)]),
      marker: {
        size: 5,
        color: Object.keys(facingsCounts).map((k) => Number(k)),
        colorscale: 'Viridis',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">
          3D Plot: Iteration vs Variance vs Max Facings
        </h3>
        <Plot
          data={data3DitVarMax}
          layout={{
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
              xaxis: { title: 'Iteration' },
              yaxis: { title: 'Variance' },
              zaxis: { title: 'Max Facings' },
            },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">
          3D Plot: Min Facings vs Variance vs Max Facings
        </h3>
        <Plot
          data={data3DvarMaxMin}
          layout={{
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
              xaxis: { title: 'Min Facings' },
              yaxis: { title: 'Variance' },
              zaxis: { title: 'Max Facings' },
            },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">2D Plot: Variance vs Max Facings</h3>
        <Plot
          data={data2D}
          layout={{
            margin: { l: 40, r: 0, b: 40, t: 0 },
            xaxis: { title: 'Variance' },
            yaxis: { title: 'Max Facings' },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Bar Chart: Max Facings Count</h3>
        <Plot
          data={dataBar}
          layout={{
            margin: { l: 50, r: 0, b: 40, t: 0 },
            xaxis: { title: 'Max Facings Count' },
            yaxis: { title: 'Iteration' },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
    </div>
  );
}
