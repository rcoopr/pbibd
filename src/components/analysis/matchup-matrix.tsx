export function MatchupMatrix({ data }: { data: number[] }) {
  const athleteCount = (1 + (1 + 8 * data.length) ** 0.5) / 2
  const cells = Array.from({ length: athleteCount })

  let index = 0

  return (
    <div className="flex flex-col items-center">
      <p className='uppercase font-semibold text-gray-500 tracking-widest'>Matchup Table</p>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${athleteCount}, 3ch)`,
          gridTemplateRows: `repeat(${athleteCount}, 3ch)`,
        }}
      >

        {cells.map((_, i) => i === 0
          ? null
          : (
              <div key={`top-${i}`} className="flex items-center justify-center row-start-1 opacity-60" style={{ gridColumn: i + 1 }}>
                {i + 1}
              </div>
            ))}

        {cells.map((_, i) => i === 0
          ? null
          : (
              <div key={`top-${i}`} className="flex items-center justify-center col-start-1 opacity-60" style={{ gridRow: i + 1 }}>
                {i}
              </div>
            ))}

        {/* counts */}
        {cells.map((_, i) => cells.map((_, j) => {
          const used = j >= i + 1
          if (!used)
            return null

          const count = data[index++]

          return (
            <div
              key={`${i}-${j}`}
              className="flex items-center justify-center -mr-px relative"
              style={{
                gridColumn: j + 1,
                gridRow: i + 2,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {count}
              </div>
              <div className="absolute inset-0 bg-blue-400" style={{ opacity: count * 0.125 }}></div>
              <div className="absolute inset-0 border-zinc-200 border-b border-r border-l"></div>
            </div>
          )
        }))}

        <div style={{ gridArea: '2 / 1 / -1 / -1' }} className="border-t relative border-zinc-400" />
        <div style={{ gridArea: '1 / 2 / -1 / -1' }} className="border-l relative border-zinc-400" />
      </div>
    </div>
  )
}
