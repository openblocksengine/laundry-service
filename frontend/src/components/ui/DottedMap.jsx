import * as React from "react"
import { createMap } from "svg-dotted-map"
import { cn } from "../../lib/utils"

export const DottedMap = React.memo(({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  markerColor = "#EA580C",
  dotRadius = 0.2,
  stagger = true,
  className,
  style,
}) => {
  // Memoize map generation to prevent heavy recalculations on every render
  const { points, processedMarkers, xStep, yToRowIndex } = React.useMemo(() => {
    try {
        const { points: mapPoints, addMarkers } = createMap({
            width,
            height,
            mapSamples,
        });

        const pMarkers = addMarkers(markers);
        const sorted = [...mapPoints].sort((a, b) => a.y - b.y || a.x - b.x);
        const rowMap = new Map();
        let step = 0;
        let prevY = Number.NaN;
        let prevXInRow = Number.NaN;

        for (const p of sorted) {
            if (p.y !== prevY) {
                prevY = p.y;
                prevXInRow = Number.NaN;
                if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size);
            }
            if (!Number.isNaN(prevXInRow)) {
                const delta = p.x - prevXInRow;
                if (delta > 0) step = step === 0 ? delta : Math.min(step, delta);
            }
            prevXInRow = p.x;
        }

        return { points: mapPoints, processedMarkers: pMarkers, xStep: step || 1, yToRowIndex: rowMap };
    } catch (e) {
        console.error("DottedMap generation error:", e);
        return { points: [], processedMarkers: [], xStep: 1, yToRowIndex: new Map() };
    }
  }, [width, height, mapSamples, markers]);

  if (!points || points.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-slate-300", className)}
      style={{ width: "100%", height: "100%", ...style }}
      aria-hidden="true"
    >
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        return (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius}
            fill="currentColor"
            key={`dot-${index}`}
          />
        );
      })}
      {processedMarkers.map((marker, index) => {
        const rowIndex = yToRowIndex.get(marker.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        return (
          <circle
            cx={marker.x + offsetX}
            cy={marker.y}
            r={marker.size ?? dotRadius}
            fill={markerColor}
            key={`marker-${index}`}
          />
        );
      })}
    </svg>
  );
});

DottedMap.displayName = "DottedMap";