import type { SVGProps } from 'react'
import { ICONS, type IconName } from './icons'

/** Зсув viewBox: іконка центрується за реальними межами малюнка, а не за сіткою 12 × 12. */
function centerOffset(grid: readonly string[]): [number, number] {
  let x0 = 12
  let x1 = -1
  let y0 = 12
  let y1 = -1
  grid.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === '.') return
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }),
  )
  return [(x0 + x1 + 1) / 2 - 6, (y0 + y1 + 1) / 2 - 6]
}

const OFFSETS = Object.fromEntries(
  Object.entries(ICONS).map(([name, grid]) => [name, centerOffset(grid)]),
) as Record<IconName, [number, number]>

type PixelIconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName
  /** Розмір у px: 24 або 48. */
  size?: 24 | 48
  /** Активний піксель «o» стає spark. */
  active?: boolean
}

export function PixelIcon({ name, size = 24, active = false, ...props }: PixelIconProps) {
  const [dx, dy] = OFFSETS[name]

  return (
    <svg
      viewBox={`${dx} ${dy} 12 12`}
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      {ICONS[name].flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={cell === 'o' && active ? 'var(--spark)' : undefined}
            />
          ),
        ),
      )}
    </svg>
  )
}
