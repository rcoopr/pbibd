import { useState } from 'react';
import { Athlete } from '../types';

interface Props {
  athletes: Athlete[];
}

export default function FacingVisualizer({ athletes }: Props) {
  const [hoveredAthlete, setHoveredAthlete] = useState<number | null>(null);
  const spacing = 40;
  const radius = 12;
  const height = 200;
  const width = athletes.length * spacing;

  // const getFacings = (athleteId: number) => {
  //   const athlete = athletes.find(a => a.id === athleteId);
  //   return athlete ? Array.from(athlete.facedCount.entries()) : [];
  // };

  const handleHover = (athleteId: number | null) => {
    setHoveredAthlete(athleteId);
  };

  return (
    <svg width={width} height={height} className="max-w-full">
      {/* Top row of numbers */}
      {athletes.map((athlete, i) => (
        <g
          key={`top-${athlete.id}`}
          onMouseEnter={() => handleHover(athlete.id)}
          onMouseLeave={() => handleHover(null)}
        >
          <circle
            cx={i * spacing + spacing / 2}
            cy={radius * 2}
            r={radius}
            className="fill-gray-100 stroke-gray-400"
          />
          <text
            x={i * spacing + spacing / 2}
            y={radius * 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium select-none pointer-events-none"
          >
            {athlete.id}
          </text>
        </g>
      ))}

      {/* Bottom row of numbers */}
      {athletes.map((athlete, i) => (
        <g
          key={`bottom-${athlete.id}`}
          onMouseEnter={() => handleHover(athlete.id)}
          onMouseLeave={() => handleHover(null)}
        >
          <circle
            cx={i * spacing + spacing / 2}
            cy={height - radius * 2}
            r={radius}
            className="fill-gray-100 stroke-gray-400"
          />
          <text
            x={i * spacing + spacing / 2}
            y={height - radius * 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-medium select-none pointer-events-none"
          >
            {athlete.id}
          </text>
        </g>
      ))}

      {/* Connection lines - only from top to bottom */}
      {athletes.map((topAthlete, i) =>
        athletes.map((bottomAthlete, j) => {
          const count = topAthlete.facedCount.get(bottomAthlete.id) || 0;
          if (count === 0) return null;

          const isHighlighted =
            hoveredAthlete === topAthlete.id || hoveredAthlete === bottomAthlete.id;

          return (
            <path
              key={`${topAthlete.id}-${bottomAthlete.id}`}
              d={`M ${i * spacing + spacing / 2} ${radius * 2} 
                  C ${i * spacing + spacing / 2} ${height / 2},
                    ${j * spacing + spacing / 2} ${height / 2},
                    ${j * spacing + spacing / 2} ${height - radius * 2}`}
              className={`stroke-current fill-none transition-opacity duration-200 ${
                isHighlighted ? 'opacity-100' : 'opacity-10'
              }`}
              strokeWidth={Math.max(1, count / 2)}
            />
          );
        })
      )}
    </svg>
  );
}
