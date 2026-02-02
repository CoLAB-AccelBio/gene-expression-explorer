import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneExpression } from "@/types/expression";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
} from "recharts";

interface ExpressionViolinPlotProps {
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

export function ExpressionViolinPlot({
  geneExpression,
  groups,
  selectedGroups,
}: ExpressionViolinPlotProps) {
  const filteredGroups = groups.filter(g => selectedGroups.includes(g));
  
  // Create jittered scatter data for each group
  const scatterData = filteredGroups.flatMap((group, groupIndex) => {
    const groupSamples = geneExpression.samples.filter(s => s.group === group);
    
    return groupSamples.map((sample, i) => ({
      x: groupIndex + (Math.random() - 0.5) * 0.3,
      y: sample.value,
      group,
      sampleId: sample.sampleId,
      color: CHART_COLORS[groups.indexOf(group) % CHART_COLORS.length],
    }));
  });

  return (
    <Card className="glass-panel animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="gene-tag">{geneExpression.gene}</span>
          <span className="text-muted-foreground font-normal">Strip Plot</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-0.5, filteredGroups.length - 0.5]}
              ticks={filteredGroups.map((_, i) => i)}
              tickFormatter={(value) => filteredGroups[Math.round(value)] || ""}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{
                value: "Expression (log2)",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{data.sampleId}</p>
                      <p className="text-sm text-muted-foreground">{data.group}</p>
                      <p className="text-sm">Expression: {data.y.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {filteredGroups.map((group, index) => (
              <Scatter
                key={group}
                name={group}
                data={scatterData.filter(d => d.group === group)}
                fill={CHART_COLORS[groups.indexOf(group) % CHART_COLORS.length]}
                fillOpacity={0.7}
              />
            ))}
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
