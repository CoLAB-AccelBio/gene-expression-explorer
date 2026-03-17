import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneExpression } from "@/types/expression";
import { calculateBoxPlotStats } from "@/utils/statistics";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";

interface GeneBoxPlotProps {
  expressions: GeneExpression[];
  selectedGenes: string[];
  selectedGroups: string[];
  groups: string[];
}

const GENE_COLORS = [
  "hsl(200, 80%, 50%)",
  "hsl(340, 75%, 55%)",
  "hsl(165, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(25, 85%, 55%)",
  "hsl(45, 90%, 50%)",
  "hsl(120, 50%, 45%)",
  "hsl(0, 70%, 55%)",
  "hsl(220, 70%, 55%)",
  "hsl(300, 50%, 50%)",
];

const GeneBoxShape = (props: any) => {
  const { x, y, width, payload } = props;
  if (!payload) return null;

  const { q1, q3, median, min, max, color } = payload;
  const yScale = props.yAxis;
  if (!yScale) return null;

  const boxWidth = Math.min(width * 0.8, 70);
  const centerX = x + width / 2;
  const boxX = centerX - boxWidth / 2;

  const y1 = yScale.scale(q1);
  const y3 = yScale.scale(q3);
  const yMedian = yScale.scale(median);
  const yMin = yScale.scale(min);
  const yMax = yScale.scale(max);

  const boxHeight = Math.abs(y1 - y3);
  const boxY = Math.min(y1, y3);

  return (
    <g>
      <line x1={centerX} y1={yMin} x2={centerX} y2={yMax} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
      <line x1={centerX - boxWidth / 4} y1={yMin} x2={centerX + boxWidth / 4} y2={yMin} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
      <line x1={centerX - boxWidth / 4} y1={yMax} x2={centerX + boxWidth / 4} y2={yMax} stroke="hsl(var(--foreground))" strokeWidth={1.5} />
      <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} fill={color} fillOpacity={0.7} stroke={color} strokeWidth={2} rx={2} />
      <line x1={boxX} y1={yMedian} x2={boxX + boxWidth} y2={yMedian} stroke="hsl(var(--foreground))" strokeWidth={2} />
    </g>
  );
};

export function GeneBoxPlot({
  expressions,
  selectedGenes,
  selectedGroups,
  groups,
}: GeneBoxPlotProps) {
  const filteredGroups = groups.filter(g => selectedGroups.includes(g));

  const chartData = selectedGenes.map((gene, index) => {
    const geneExpr = expressions.find(e => e.gene === gene);
    if (!geneExpr) return null;

    const values = geneExpr.samples
      .filter(s => filteredGroups.includes(s.group))
      .map(s => s.value);

    if (values.length === 0) return null;

    const stats = calculateBoxPlotStats(values);
    return {
      gene,
      ...stats,
      color: GENE_COLORS[index % GENE_COLORS.length],
    };
  }).filter(Boolean);

  if (chartData.length === 0) return null;

  const allValues = chartData.flatMap((d: any) => [d.min, d.max]);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPadding = (yMax - yMin) * 0.1 || 1;

  return (
    <Card className="glass-panel animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          <span className="text-muted-foreground font-normal">Relative Gene Expression</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, 50 + chartData.length * 15)}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="gene"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontFamily: "monospace" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              angle={selectedGenes.length > 8 ? -45 : 0}
              textAnchor={selectedGenes.length > 8 ? "end" : "middle"}
              height={selectedGenes.length > 8 ? 60 : 30}
            />
            <YAxis
              domain={[yMin - yPadding, yMax + yPadding]}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: "Expression (log2)",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
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
                      <p className="font-semibold text-foreground font-mono mb-2">{data.gene}</p>
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
            <Scatter dataKey="median" shape={<GeneBoxShape />} legendType="none" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
