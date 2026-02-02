import { ExpressionDataset } from "@/types/expression";

// Generate realistic gene expression demo data
const generateExpressionValues = (
  baseValue: number,
  variance: number,
  count: number,
  groupEffect: number = 0
): number[] => {
  return Array.from({ length: count }, () => {
    const noise = (Math.random() - 0.5) * variance;
    return Math.max(0, baseValue + groupEffect + noise);
  });
};

const genes = [
  "TP53", "BRCA1", "BRCA2", "EGFR", "MYC", "KRAS", "PIK3CA", "PTEN",
  "RB1", "APC", "CDKN2A", "VHL", "NF1", "NF2", "MLH1", "MSH2"
];

const controlSamples = Array.from({ length: 15 }, (_, i) => ({
  sampleId: `CTRL_${String(i + 1).padStart(3, "0")}`,
  group: "Control",
  age: 35 + Math.floor(Math.random() * 30),
  tissue: "Normal"
}));

const treatmentASamples = Array.from({ length: 12 }, (_, i) => ({
  sampleId: `TRT_A_${String(i + 1).padStart(3, "0")}`,
  group: "Treatment A",
  age: 40 + Math.floor(Math.random() * 25),
  tissue: "Tumor"
}));

const treatmentBSamples = Array.from({ length: 10 }, (_, i) => ({
  sampleId: `TRT_B_${String(i + 1).padStart(3, "0")}`,
  group: "Treatment B",
  age: 38 + Math.floor(Math.random() * 28),
  tissue: "Tumor"
}));

const allSamples = [...controlSamples, ...treatmentASamples, ...treatmentBSamples];

// Gene expression patterns - some genes upregulated, some downregulated in treatment groups
const genePatterns: Record<string, { base: number; controlEffect: number; treatAEffect: number; treatBEffect: number }> = {
  TP53: { base: 8.5, controlEffect: 0, treatAEffect: -1.5, treatBEffect: -2.0 },
  BRCA1: { base: 7.2, controlEffect: 0, treatAEffect: 0.8, treatBEffect: 1.2 },
  BRCA2: { base: 6.8, controlEffect: 0, treatAEffect: 0.5, treatBEffect: 0.9 },
  EGFR: { base: 9.1, controlEffect: 0, treatAEffect: 2.5, treatBEffect: 3.2 },
  MYC: { base: 10.2, controlEffect: 0, treatAEffect: 1.8, treatBEffect: 2.5 },
  KRAS: { base: 7.5, controlEffect: 0, treatAEffect: 1.2, treatBEffect: 0.8 },
  PIK3CA: { base: 6.9, controlEffect: 0, treatAEffect: 0.6, treatBEffect: 1.5 },
  PTEN: { base: 8.0, controlEffect: 0, treatAEffect: -1.8, treatBEffect: -2.2 },
  RB1: { base: 7.8, controlEffect: 0, treatAEffect: -0.9, treatBEffect: -1.1 },
  APC: { base: 7.1, controlEffect: 0, treatAEffect: -0.5, treatBEffect: -0.3 },
  CDKN2A: { base: 6.5, controlEffect: 0, treatAEffect: -1.2, treatBEffect: -1.5 },
  VHL: { base: 7.3, controlEffect: 0, treatAEffect: -0.7, treatBEffect: -0.9 },
  NF1: { base: 6.8, controlEffect: 0, treatAEffect: 0.3, treatBEffect: 0.5 },
  NF2: { base: 7.0, controlEffect: 0, treatAEffect: 0.2, treatBEffect: 0.1 },
  MLH1: { base: 7.6, controlEffect: 0, treatAEffect: -0.4, treatBEffect: -0.6 },
  MSH2: { base: 7.4, controlEffect: 0, treatAEffect: -0.3, treatBEffect: -0.5 },
};

const expressions = genes.map(gene => {
  const pattern = genePatterns[gene] || { base: 7, controlEffect: 0, treatAEffect: 0, treatBEffect: 0 };
  
  const controlValues = generateExpressionValues(pattern.base, 1.5, controlSamples.length, pattern.controlEffect);
  const treatAValues = generateExpressionValues(pattern.base, 1.8, treatmentASamples.length, pattern.treatAEffect);
  const treatBValues = generateExpressionValues(pattern.base, 2.0, treatmentBSamples.length, pattern.treatBEffect);
  
  const samples = [
    ...controlSamples.map((s, i) => ({ sampleId: s.sampleId, value: controlValues[i], group: s.group })),
    ...treatmentASamples.map((s, i) => ({ sampleId: s.sampleId, value: treatAValues[i], group: s.group })),
    ...treatmentBSamples.map((s, i) => ({ sampleId: s.sampleId, value: treatBValues[i], group: s.group })),
  ];
  
  return { gene, samples };
});

export const demoDataset: ExpressionDataset = {
  name: "Cancer Gene Expression Study",
  description: "Expression levels of key cancer-related genes across control and treatment groups",
  genes,
  samples: allSamples,
  expressions,
  groupColumn: "group",
  groups: ["Control", "Treatment A", "Treatment B"],
};
