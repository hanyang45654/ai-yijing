import { FiveElementScore } from "../api/fiveElement";

type Point = {
  x: number;
  y: number;
};

const ELEMENT_COLOR: Record<string, string> = {
  wood: "#5a8a5a",
  fire: "#c94a3a",
  earth: "#b8923e",
  metal: "#8a8a8a",
  water: "#3a6f8a",
};

function getPoint(index: number, radius: number, center: number): Point {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function toPoints(points: Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

type FiveElementRadarProps = {
  elements: FiveElementScore[];
  size?: number;
};

export function FiveElementRadar({
  elements,
  size = 220,
}: FiveElementRadarProps) {
  const pad = Math.round(size * 0.14);
  const vbSize = size + pad * 2;
  const center = vbSize / 2;
  const maxRadius = size * 0.36;
  const labelOffset = size * 0.17;
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const outerPoints = elements.map((_, index) =>
    getPoint(index, maxRadius, center)
  );
  const valuePoints = elements.map((item, index) =>
    getPoint(index, maxRadius * (item.score / 100), center)
  );

  return (
    <svg
      className="five-radar"
      viewBox={`0 0 ${Math.round(vbSize)} ${Math.round(vbSize)}`}
      width={Math.round(size)}
      height={Math.round(size)}
      role="img"
      aria-label="五行雷达图"
      style={{ overflow: "visible" }}
    >
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={toPoints(
            elements.map((_, index) =>
              getPoint(index, maxRadius * level, center)
            )
          )}
          className="radar-grid"
        />
      ))}

      {outerPoints.map((point, index) => (
        <line
          key={elements[index].key}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          className="radar-axis"
        />
      ))}

      <polygon points={toPoints(valuePoints)} className="radar-value" />

      {elements.map((item, index) => {
        const point = getPoint(index, maxRadius + labelOffset, center);
        return (
          <text
            key={item.key}
            x={point.x}
            y={point.y}
            className="radar-label"
            fill={ELEMENT_COLOR[item.key]}
          >
            {item.name}
          </text>
        );
      })}
    </svg>
  );
}
