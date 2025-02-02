import { useState } from 'react'
import TournamentGenerator from './tournament-generator'
import TournamentLive from './tournament-live'

export function TournamentComparison() {
  const [draws, setDraws] = useState<{ type: 'generate' | 'live' }[]>([{ type: 'live' }])

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-gray-100 p-4">
      <div
        className="grid gap-8"
        style={{
          gridTemplateColumns: `repeat(${draws.length}, auto)`,
        }}
      >

        {draws.map((draw, i) => (
          <div key={i} className="flex flex-col gap-4">
            {draw.type === 'generate' ? <TournamentGenerator /> : <TournamentLive />}
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center flex-wrap items-center">
        <button className="mt-4 px-4 py-2 capitalize bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" onClick={() => setDraws([...draws, { type: 'generate' }])}>add generative draw</button>
        <button className="mt-4 px-4 py-2 capitalize bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" onClick={() => setDraws([...draws, { type: 'live' }])}>add live draw</button>
      </div>
    </div>
  )
}
