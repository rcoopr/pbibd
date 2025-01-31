import type { SavedDraw } from '@/lib/stats/generate'
import { ParameterPlots } from '@/components/analysis/parameter-plot'
import { AnalysisTable } from '@/components/analysis/draw-table'
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
    <div className="flex flex-col gap-6 p-6">
      {selectedDraw && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col">
            <h2>{selectedDraw.algorithm}</h2>
            <AnalysisTable data={selectedDraw.draws} />
          </div>
        </div>
      )}
      <ParameterPlots data={data} highlight={selectedDraw?.algorithm} />
    </div>
  )
}
