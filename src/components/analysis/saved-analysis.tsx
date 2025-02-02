import type { SavedDraw } from '@/lib/stats/generate'
import { AnalysisTable } from '@/components/analysis/draw-table'
import { ParameterPlots } from '@/components/analysis/parameter-plot'
import { useEffect, useState } from 'react'

export interface UIAnalysisData { algorithm: string, path: string, draws: SavedDraw[] }

export function SavedAnalysis({ algorithm }: { algorithm: string | null }) {
  const [data, setData] = useState<UIAnalysisData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const draws = await Promise.all(Object.entries(import.meta.glob(`../../../artefacts/draws/50-8-5/**`)).map(async ([path, read]) => {
        const json = await read() as { default: SavedDraw[] }
        const data: UIAnalysisData = { algorithm: (path.split('/').at(-1) || '').replace('.json', ''), path, draws: json.default }
        return data
      }))

      setData((draws || []))
    }
    fetchData()
  }, [])

  const selectedDraw = algorithm ? data.find(d => d.algorithm.includes(algorithm)) : null

  return (
    <>
      <section className="breakout-full">
        {selectedDraw && (
          <>
            <h2 className="font-semibold italic text-gray-600">
              {'Analysis and Draw Table for algorithm: '}
              <span className="underline">{selectedDraw.algorithm}</span>
            </h2>
            {/* <div className="bg-white rounded-lg shadow-lg overflow-x-auto"> */}
            <AnalysisTable data={selectedDraw.draws} />
            {/* </div> */}
          </>
        )}
      </section>
      <section className="breakout-full">
        <ParameterPlots data={data} highlight={selectedDraw?.algorithm} />
      </section>
    </>
  )
}
