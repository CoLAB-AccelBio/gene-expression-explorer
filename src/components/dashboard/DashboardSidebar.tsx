import { Separator } from "@/components/ui/separator";
import { FileUpload } from "./FileUpload";
import { GeneSelector } from "./GeneSelector";
import { GroupFilter } from "./GroupFilter";
import { ExpressionDataset } from "@/types/expression";
import { Dna, Database } from "lucide-react";

interface DashboardSidebarProps {
  dataset: ExpressionDataset;
  selectedGenes: string[];
  onGenesChange: (genes: string[]) => void;
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
  onDataLoad: (data: ExpressionDataset) => void;
}

export function DashboardSidebar({
  dataset,
  selectedGenes,
  onGenesChange,
  selectedGroups,
  onGroupsChange,
  onDataLoad,
}: DashboardSidebarProps) {
  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sidebar-primary/20 rounded-lg">
            <Dna className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">GeneViz</h1>
            <p className="text-xs text-sidebar-foreground/60">Expression Explorer</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        <FileUpload
          onDataLoad={onDataLoad}
          currentDataset={dataset.name}
        />
        
        <Separator className="bg-sidebar-border" />
        
        <GeneSelector
          genes={dataset.genes}
          selectedGenes={selectedGenes}
          onSelectionChange={onGenesChange}
        />
        
        <Separator className="bg-sidebar-border" />
        
        <GroupFilter
          groups={dataset.groups}
          selectedGroups={selectedGroups}
          onSelectionChange={onGroupsChange}
        />
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <Database className="h-4 w-4" />
          <span>{dataset.samples.length} samples • {dataset.genes.length} genes</span>
        </div>
      </div>
    </aside>
  );
}
