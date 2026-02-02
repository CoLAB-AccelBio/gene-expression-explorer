import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneExpression, SampleAnnotation } from "@/types/expression";
import { getMeanAndStd, calculateZScore } from "@/utils/statistics";
import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ExpressionHeatmapProps {
  expressions: GeneExpression[];
  samples: SampleAnnotation[];
  selectedGenes: string[];
  selectedGroups: string[];
  groups: string[];
}

const GROUP_COLORS: Record<string, string> = {
  0: "hsl(200, 80%, 50%)",
  1: "hsl(340, 75%, 55%)",
  2: "hsl(165, 60%, 45%)",
  3: "hsl(280, 60%, 55%)",
  4: "hsl(25, 85%, 55%)",
  5: "hsl(45, 90%, 50%)",
};

function getHeatmapColor(zScore: number): string {
  // Blue (low) -> White (mid) -> Red (high)
  const clampedZ = Math.max(-3, Math.min(3, zScore));
  const normalized = (clampedZ + 3) / 6; // 0 to 1
  
  if (normalized < 0.5) {
    // Blue to White
    const t = normalized * 2;
    const r = Math.round(66 + (245 - 66) * t);
    const g = Math.round(133 + (245 - 133) * t);
    const b = Math.round(244 + (245 - 244) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // White to Red
    const t = (normalized - 0.5) * 2;
    const r = Math.round(245 + (220 - 245) * t);
    const g = Math.round(245 + (53 - 245) * t);
    const b = Math.round(245 + (69 - 245) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function ExpressionHeatmap({
  expressions,
  samples,
  selectedGenes,
  selectedGroups,
  groups,
}: ExpressionHeatmapProps) {
  const heatmapData = useMemo(() => {
    const filteredExpressions = expressions.filter(e => selectedGenes.includes(e.gene));
    const filteredSamples = samples.filter(s => selectedGroups.includes(s.group));
    
    // Sort samples by group
    const sortedSamples = [...filteredSamples].sort((a, b) => {
      const groupIndexA = groups.indexOf(a.group);
      const groupIndexB = groups.indexOf(b.group);
      return groupIndexA - groupIndexB;
    });
    
    return filteredExpressions.map(expr => {
      const allValues = expr.samples.map(s => s.value);
      const { mean, std } = getMeanAndStd(allValues);
      
      const cells = sortedSamples.map(sample => {
        const sampleData = expr.samples.find(s => s.sampleId === sample.sampleId);
        const value = sampleData?.value ?? 0;
        const zScore = calculateZScore(value, mean, std);
        
        return {
          sampleId: sample.sampleId,
          group: sample.group,
          value,
          zScore,
          color: getHeatmapColor(zScore),
        };
      });
      
      return { gene: expr.gene, cells };
    });
  }, [expressions, samples, selectedGenes, selectedGroups, groups]);
  
  const sortedSamples = useMemo(() => {
    return samples
      .filter(s => selectedGroups.includes(s.group))
      .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));
  }, [samples, selectedGroups, groups]);

  if (selectedGenes.length === 0) {
    return (
      <Card className="glass-panel">
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          Select genes to view heatmap
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Expression Heatmap
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Z-score normalized)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-fit">
            {/* Group header */}
            <div className="flex mb-1 ml-20">
              {selectedGroups.map((group, groupIdx) => {
                const groupSampleCount = sortedSamples.filter(s => s.group === group).length;
                return (
                  <div
                    key={group}
                    className="text-xs font-medium text-center truncate px-1"
                    style={{
                      width: `${groupSampleCount * 12}px`,
                      color: GROUP_COLORS[groups.indexOf(group) % 6],
                    }}
                  >
                    {group}
                  </div>
                );
              })}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex flex-col gap-0.5">
              {heatmapData.map(({ gene, cells }) => (
                <div key={gene} className="flex items-center gap-1">
                  <div className="w-16 text-xs font-mono text-right pr-2 text-foreground truncate">
                    {gene}
                  </div>
                  <div className="flex">
                    {cells.map((cell, idx) => (
                      <Tooltip key={`${gene}-${cell.sampleId}`}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-3 h-5 cursor-pointer transition-transform hover:scale-110 hover:z-10"
                            style={{ backgroundColor: cell.color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-semibold">{gene}</p>
                          <p>{cell.sampleId}</p>
                          <p>Group: {cell.group}</p>
                          <p>Value: {cell.value.toFixed(2)}</p>
                          <p>Z-score: {cell.zScore.toFixed(2)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex h-4 w-32 rounded overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: getHeatmapColor(-3 + (i * 6 / 19)) }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
