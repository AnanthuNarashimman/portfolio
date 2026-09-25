import { PIXEL_ICONS, type PixelIconName } from './pixelIcons'

export default function PixelIcon({ name, className }: { name: PixelIconName; className?: string }) {
  const rows = PIXEL_ICONS[name]
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" className={className} fill="currentColor">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)),
      )}
    </svg>
  )
}
