import type { SavedDraw } from '@/lib/stats/generate'
import { AnalysisTable } from '@/components/analysis/table'
import { useEffect, useState } from 'react'

export function SavedAnalysis({ algorithm }: { algorithm?: string }) {
  const [data, setData] = useState<[string, SavedDraw[]][]>([])

  useEffect(() => {
    const fetchData = async () => {
      const draws = await Promise.all(Object.entries(import.meta.glob(`../../../artefacts/draws/50-8-5/**`)).map(async ([path, read]) => {
        const json = await read() as { default: SavedDraw[] }
        return [path, json.default]
      })) as [string, SavedDraw[]][]

      setData(draws || [])
    }
    fetchData()
  }, [])

  if (!algorithm) return null

  const selectedDraw = data.find(d => d[0].includes(algorithm))
  if (!selectedDraw) return null
  
  console.log({algorithm, data})
  const [name, draw] = selectedDraw
  console.log({data, name, draw})

  return (
    <div className="flex flex-col">
      <h2>{name}</h2>
      <AnalysisTable data={draw} />
    </div>
  )
}
