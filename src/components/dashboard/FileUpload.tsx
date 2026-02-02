import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileJson, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { ExpressionDataset } from "@/types/expression";

interface FileUploadProps {
  onDataLoad: (data: ExpressionDataset) => void;
  currentDataset?: string;
}

export function FileUpload({ onDataLoad, currentDataset }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!file.name.endsWith(".json")) {
      setError("Please upload a JSON file");
      return;
    }
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExpressionDataset;
      
      // Basic validation
      if (!data.genes || !data.samples || !data.expressions) {
        throw new Error("Invalid data structure");
      }
      
      onDataLoad(data);
    } catch {
      setError("Failed to parse JSON file. Please check the format.");
    }
  }, [onDataLoad]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  
  return (
    <div className="space-y-3">
      <label className="data-label">Data Source</label>
      
      {currentDataset && (
        <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-md">
          <Check className="h-4 w-4 text-accent-foreground" />
          <span className="text-sm font-medium text-accent-foreground truncate">
            {currentDataset}
          </span>
        </div>
      )}
      
      <Card
        className={`
          border-2 border-dashed p-4 text-center transition-colors cursor-pointer
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
        `}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center gap-2 py-2">
          {isDragging ? (
            <FileJson className="h-8 w-8 text-primary animate-pulse" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm">
            <span className="text-primary font-medium">Upload JSON</span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </div>
        </div>
      </Card>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
