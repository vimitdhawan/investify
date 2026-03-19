'use client';

/**
 * BarChart Component
 * Reusable horizontal bar chart using Visx for D3 visualization
 */
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  valueFormatter?: (value: number) => string;
  barColor?: string;
}

const defaultMargin = { top: 20, right: 20, bottom: 40, left: 200 };

export function BarChart({
  data,
  width = 800,
  height = 400,
  margin = defaultMargin,
  valueFormatter = (v) => `${v.toFixed(2)}%`,
  barColor = 'hsl(var(--primary))',
}: BarChartProps) {
  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const yScale = scaleBand<string>({
    range: [0, yMax],
    domain: data.map((d) => d.label),
    padding: 0.2,
  });

  const xScale = scaleLinear<number>({
    range: [0, xMax],
    domain: [0, Math.max(...data.map((d) => d.value), 1)],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Bars */}
        {data.map((d) => {
          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();
          const barY = yScale(d.label);

          return (
            <Group key={`bar-${d.label}`}>
              <Bar
                x={0}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color || barColor}
                rx={4}
              />
              {/* Value label on bar */}
              <Text
                x={barWidth + 8}
                y={(barY ?? 0) + barHeight / 2}
                verticalAnchor="middle"
                fontSize={12}
                fill="hsl(var(--foreground))"
              >
                {valueFormatter(d.value)}
              </Text>
            </Group>
          );
        })}

        {/* Y Axis (labels) */}
        <AxisLeft
          scale={yScale}
          stroke="hsl(var(--border))"
          tickStroke="hsl(var(--border))"
          tickLabelProps={() => ({
            fill: 'hsl(var(--foreground))',
            fontSize: 11,
            textAnchor: 'end',
            dy: '0.33em',
            dx: -4,
          })}
          hideAxisLine={false}
          hideTicks={false}
        />

        {/* X Axis (values) */}
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke="hsl(var(--border))"
          tickStroke="hsl(var(--border))"
          numTicks={5}
          tickLabelProps={() => ({
            fill: 'hsl(var(--foreground))',
            fontSize: 10,
            textAnchor: 'middle',
          })}
          label="Percentage (%)"
          labelProps={{
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 12,
            textAnchor: 'middle',
          }}
        />
      </Group>
    </svg>
  );
}
