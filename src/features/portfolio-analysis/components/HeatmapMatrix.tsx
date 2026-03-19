'use client';

/**
 * HeatmapMatrix Component
 * D3/Visx heatmap for visualizing portfolio overlap between schemes
 */
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';

import { useMemo } from 'react';

import type { SchemeMetadata } from '../type';

interface HeatmapMatrixProps {
  schemes: SchemeMetadata[];
  matrix: number[][];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 100, right: 20, bottom: 20, left: 200 };

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'hsl(var(--popover))',
  color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '12px',
};

export function HeatmapMatrix({
  schemes,
  matrix,
  width = 900,
  height = 900,
  margin = defaultMargin,
}: HeatmapMatrixProps) {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<{ rowScheme: string; colScheme: string; overlap: number }>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const cellWidth = xMax / schemes.length;
  const cellHeight = yMax / schemes.length;

  // Calculate color scale based on max overlap
  const maxOverlap = useMemo(() => {
    let max = 0;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (i !== j && matrix[i][j] > max) {
          max = matrix[i][j];
        }
      }
    }
    return max;
  }, [matrix]);

  const colorScale = scaleLinear<string>({
    domain: [0, maxOverlap],
    range: ['hsl(var(--muted))', 'hsl(var(--primary))'],
  });

  const handleMouseOver = (event: React.MouseEvent<SVGRectElement>, row: number, col: number) => {
    const target = event.target as SVGElement;
    const coords = localPoint(target.ownerSVGElement!, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: {
        rowScheme: schemes[row].name,
        colScheme: schemes[col].name,
        overlap: matrix[row][col],
      },
    });
  };

  // Truncate scheme name for display
  const truncateName = (name: string, maxLength: number = 25) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} ref={containerRef}>
        <Group left={margin.left} top={margin.top}>
          {/* Column labels (top) */}
          {schemes.map((scheme, i) => (
            <Text
              key={`col-label-${i}`}
              x={i * cellWidth + cellWidth / 2}
              y={-10}
              fontSize={10}
              textAnchor="end"
              verticalAnchor="middle"
              angle={-45}
              fill="hsl(var(--foreground))"
            >
              {truncateName(scheme.name, 20)}
            </Text>
          ))}

          {/* Row labels (left) */}
          {schemes.map((scheme, i) => (
            <Text
              key={`row-label-${i}`}
              x={-10}
              y={i * cellHeight + cellHeight / 2}
              fontSize={10}
              textAnchor="end"
              verticalAnchor="middle"
              fill="hsl(var(--foreground))"
            >
              {truncateName(scheme.name, 25)}
            </Text>
          ))}

          {/* Heatmap cells */}
          {matrix.map((row, i) =>
            row.map((value, j) => {
              const isDiagonal = i === j;
              const fillColor = isDiagonal ? 'hsl(var(--muted) / 0.3)' : colorScale(value);

              return (
                <rect
                  key={`cell-${i}-${j}`}
                  x={j * cellWidth}
                  y={i * cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={fillColor}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  rx={2}
                  onMouseMove={(event) => handleMouseOver(event, i, j)}
                  onMouseLeave={hideTooltip}
                  style={{ cursor: isDiagonal ? 'default' : 'pointer' }}
                />
              );
            })
          )}

          {/* Cell values (optional for smaller matrices) */}
          {schemes.length <= 10 &&
            matrix.map((row, i) =>
              row.map((value, j) => {
                const isDiagonal = i === j;
                return (
                  <Text
                    key={`text-${i}-${j}`}
                    x={j * cellWidth + cellWidth / 2}
                    y={i * cellHeight + cellHeight / 2}
                    fontSize={isDiagonal ? 9 : 11}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    fill={isDiagonal ? 'hsl(var(--muted-foreground))' : 'hsl(var(--background))'}
                    fontWeight={isDiagonal ? 'normal' : 'bold'}
                    pointerEvents="none"
                  >
                    {value}
                  </Text>
                );
              })
            )}
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <div className="font-semibold">{tooltipData.rowScheme}</div>
            <div className="text-xs text-muted-foreground">vs</div>
            <div className="font-semibold">{tooltipData.colScheme}</div>
            <div className="mt-1 text-sm">
              <strong>{tooltipData.overlap}</strong> stocks in common
            </div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
