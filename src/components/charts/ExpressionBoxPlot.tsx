import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneExpression } from "@/types/expression";
import { getBoxPlotDataByGroup } from "@/utils/statistics";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
  Cell,
  Legend,
} from "recharts";

interface ExpressionBoxPlotProps {
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

export function ExpressionBoxPlot({
  geneExpression,
  groups,
  selectedGroups,
}: ExpressionBoxPlotProps) {
  const filteredGroups = groups.filter(g => selectedGroups.includes(g));
  const boxPlotData = getBoxPlotDataByGroup(geneExpression, filteredGroups);
  
  const chartData = boxPlotData.map((data, index) => ({
    group: data.group,
    median: data.median,
    q1: data.q1,
    q3: data.q3,
    min: data.min,
    max: data.max,
    range: [data.q1, data.q3],
    whisker: [data.min - data.median, data.max - data.median],
    color: CHART_COLORS[groups.indexOf(data.group) % CHART_COLORS.length],
    values: data.values,
  }));

  return (
    <Card className="glass-panel animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="gene-tag">{geneExpression.gene}</span>
          <span className="text-muted-foreground font-normal">Expression by Group</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="group" 
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              label={{ 
                value: "Expression (log2)", 
                angle: -90, 
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12
              }}
              tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-foreground mb-2">{data.group}</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Max:</span> {data.max.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">Q3:</span> {data.q3.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">Median:</span> <strong>{data.median.toFixed(2)}</strong></p>
                        <p><span className="text-muted-foreground">Q1:</span> {data.q1.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">Min:</span> {data.min.toFixed(2)}</p>
                        <p><span className="text-muted-foreground">n:</span> {data.values.length}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="median" barSize={50} radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
              <ErrorBar
                dataKey="whisker"
                width={20}
                strokeWidth={2}
                stroke="hsl(var(--foreground))"
              />
            </Bar>
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
