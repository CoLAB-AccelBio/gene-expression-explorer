import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneExpression } from "@/types/expression";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ExpressionHistogramProps {
  geneExpression: GeneExpression;
  groups: string[];
  selectedGroups: string[];
}

const CHART_COLORS = [
  "hsl(200, 80%, 50%)",
  "hsl(340, 75%, 55%)",
  "hsl(165, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(25, 85%, 55%)",
  "hsl(45, 90%, 50%)",
];

function createHistogramBins(values: number[], binCount: number = 15) {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;
  
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0,
  }));
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
    if (binIndex >= 0 && binIndex < bins.length) {
      bins[binIndex].count++;
    }
  });
  
  return bins;
}

export function ExpressionHistogram({
  geneExpression,
  groups,
  selectedGroups,
}: ExpressionHistogramProps) {
  const filteredGroups = groups.filter(g => selectedGroups.includes(g));
  
  // Create combined histogram data
  const allValues = geneExpression.samples
    .filter(s => selectedGroups.includes(s.group))
    .map(s => s.value);
  
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const binCount = 15;
  const binWidth = (max - min) / binCount;
  
  const histogramData = Array.from({ length: binCount }, (_, i) => {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
    
    const result: Record<string, number | string> = { bin: binLabel, binMid: (binStart + binEnd) / 2 };
    
    filteredGroups.forEach(group => {
      const groupValues = geneExpression.samples
        .filter(s => s.group === group)
        .map(s => s.value);
      
      result[group] = groupValues.filter(v => v >= binStart && v < binEnd).length;
    });
    
    return result;
  });

  return (
    <Card className="glass-panel animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="gene-tag">{geneExpression.gene}</span>
          <span className="text-muted-foreground font-normal">Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={histogramData} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="binMid"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: "Expression (log2)",
                position: "bottom",
                offset: 15,
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-xs text-muted-foreground mb-2">Expression: {Number(label).toFixed(2)}</p>
                      {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {filteredGroups.map((group, index) => (
              <Bar
                key={group}
                dataKey={group}
                fill={CHART_COLORS[groups.indexOf(group) % CHART_COLORS.length]}
                fillOpacity={0.7}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
