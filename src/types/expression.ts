export interface SampleAnnotation {
  sampleId: string;
  group: string;
  [key: string]: string | number;
}

export interface GeneExpression {
  gene: string;
  samples: {
    sampleId: string;
    value: number;
    group: string;
  }[];
}

export interface ExpressionDataset {
  name: string;
  description?: string;
  genes: string[];
  samples: SampleAnnotation[];
  expressions: GeneExpression[];
  groupColumn: string;
  groups: string[];
}

export interface BoxPlotData {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  values: number[];
}

export interface HeatmapCell {
  gene: string;
  sample: string;
  value: number;
  group: string;
  zScore: number;
}
