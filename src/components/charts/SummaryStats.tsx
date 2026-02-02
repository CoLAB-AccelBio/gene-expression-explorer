import { Card, CardContent } from "@/components/ui/card";
import { GeneExpression } from "@/types/expression";
import { getMeanAndStd } from "@/utils/statistics";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface SummaryStatsProps {
  expressions: GeneExpression[];
  selectedGenes: string[];
  selectedGroups: string[];
  groups: string[];
}

const GROUP_COLORS = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
  "text-chart-5",
  "text-chart-6",
];

export function SummaryStats({
  expressions,
  selectedGenes,
  selectedGroups,
  groups,
}: SummaryStatsProps) {
  const filteredExpressions = expressions.filter(e => selectedGenes.includes(e.gene));
  
  const stats = filteredExpressions.map(expr => {
    const groupStats = selectedGroups.map(group => {
      const values = expr.samples.filter(s => s.group === group).map(s => s.value);
      const { mean, std } = getMeanAndStd(values);
      return { group, mean, std, n: values.length };
    });
    
    // Find max difference between groups
    let maxDiff = 0;
    let diffGroups: [string, string] = ["", ""];
    for (let i = 0; i < groupStats.length; i++) {
      for (let j = i + 1; j < groupStats.length; j++) {
        const diff = Math.abs(groupStats[i].mean - groupStats[j].mean);
        if (diff > maxDiff) {
          maxDiff = diff;
          diffGroups = [groupStats[i].group, groupStats[j].group];
        }
      }
    }
    
    return { gene: expr.gene, groupStats, maxDiff, diffGroups };
  });

  if (selectedGenes.length === 0) {
    return (
      <Card className="glass-panel">
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select genes to view statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel animate-fade-in">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {stats.map(({ gene, groupStats, maxDiff }) => (
            <div key={gene} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="gene-tag text-sm">{gene}</span>
                <div className="flex items-center gap-1 text-sm">
                  {maxDiff > 1.5 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : maxDiff > 0.5 ? (
                    <Minus className="h-4 w-4 text-chart-3" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">Δ {maxDiff.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {groupStats.map((stat, idx) => (
                  <div key={stat.group} className="bg-muted/50 rounded-md p-2">
                    <div className={`text-xs font-medium truncate ${GROUP_COLORS[groups.indexOf(stat.group) % 6]}`}>
                      {stat.group}
                    </div>
                    <div className="font-mono mt-1">
                      <span className="text-foreground">{stat.mean.toFixed(2)}</span>
                      <span className="text-muted-foreground text-xs"> ±{stat.std.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">n={stat.n}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
