import type { SavedSummary } from '@/lib/stats/generate'
import { useEffect, useState } from 'react'

interface SummaryTableProps {
  onRowSelect: (algorithm: FlatAnalysis['algorithm']) => void
  selectedRow: string | null
}

interface FlatAnalysis {
  algorithm: string
  athletes: number
  heatSize: number
  rounds: number
  mean: number
  variance: number
  varianceMin: number
  varianceChange: number
  minMatchups: number
  maxMatchups: number
  count: number
  optimal: number
}

const fmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 })

export function SummaryTable({ onRowSelect, selectedRow }: SummaryTableProps) {
  const [data, setData] = useState<FlatAnalysis[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const allSummaries = await Promise.all(Object.entries(import.meta.glob('../../../artefacts/summary/**')).map(async ([path, read]) => {
        const json = await read()
        return [path, json]
      })) as [string, SavedSummary][]

      const flatSummaries: FlatAnalysis[] = allSummaries.map(([path, analysis]) => {
        const algorithm = (path.split('/').at(-1) || '<noname>').replace('.json', '')
        const params = (path.split('/').at(-2) || '').split('-')

        return {
          algorithm,
          athletes: Number(params[0]) || 0,
          heatSize: Number(params[1]) || 0,
          rounds: Number(params[2]) || 0,
          mean: analysis.matchups.mean,
          variance: analysis.matchups.variance,
          varianceMin: analysis.matchups.varianceMin,
          varianceChange: analysis.matchups.varianceChange,
          minMatchups: analysis.matchups.min,
          maxMatchups: analysis.matchups.max,
          count: analysis.count,
          optimal: analysis.optimal,
        }
      })
      setData(flatSummaries.sort((a, b) => a.varianceChange - b.varianceChange))
    }
    fetchData()
  }, [])

  const leftColumns = ['algorithm', 'athletes', 'heatSize', 'rounds'] as const satisfies (keyof FlatAnalysis)[]
  const rightColumns = ['mean', 'variance', 'varianceMin', 'varianceChange', 'minMatchups', 'maxMatchups', 'count', 'optimal'] as const satisfies (keyof FlatAnalysis)[]

  const formatHeader = (header: string) => {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...leftColumns, '', ...rightColumns].map((header, index) => (
              <th
                key={header || `spacer-${index}`}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${header === '' ? 'w-8' : ''}
                  ${index === leftColumns.length ? 'border-l border-gray-200' : ''}`}
              >
                {header.startsWith('variance') ? <VarianceHeader text={header} /> : formatHeader(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowSelect(row.algorithm)}
              className={`
                cursor-pointer transition-colors duration-150 ease-in-out
                ${selectedRow === row.algorithm
              ? 'bg-blue-50 hover:bg-blue-100/70'
              : rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              {leftColumns.map(column => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {row[column]}
                </td>
              ))}
              <td className="border-l border-gray-200"></td>
              {rightColumns.map(column => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {typeof row[column] === 'number' ? fmt.format(row[column]) : row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VarianceHeader({ text }: { text: string }) {
  return text.endsWith('Min')
    ? (
        <span className="lowercase">
          {text.replace('Min', '').replace('variance', 'σ')}
          <sup>2</sup>
          <sub className="uppercase">min</sub>
        </span>
      )
    : (
        <span className="lowercase">
          σ
          <sup>2</sup>
          <sub className="uppercase">
            {text.replace('variance', '')}
          </sub>
        </span>
      )
}
