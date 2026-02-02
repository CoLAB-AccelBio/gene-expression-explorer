import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GroupFilterProps {
  groups: string[];
  selectedGroups: string[];
  onSelectionChange: (groups: string[]) => void;
}

const GROUP_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
];

export function GroupFilter({
  groups,
  selectedGroups,
  onSelectionChange,
}: GroupFilterProps) {
  const toggleGroup = (group: string) => {
    if (selectedGroups.includes(group)) {
      if (selectedGroups.length > 1) {
        onSelectionChange(selectedGroups.filter(g => g !== group));
      }
    } else {
      onSelectionChange([...selectedGroups, group]);
    }
  };
  
  const selectAll = () => onSelectionChange([...groups]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="data-label">Sample Groups</label>
        {selectedGroups.length < groups.length && (
          <button
            onClick={selectAll}
            className="text-xs text-primary hover:underline"
          >
            Select all
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {groups.map((group, index) => (
          <div key={group} className="flex items-center gap-2">
            <Checkbox
              id={`group-${group}`}
              checked={selectedGroups.includes(group)}
              onCheckedChange={() => toggleGroup(group)}
              disabled={selectedGroups.length === 1 && selectedGroups.includes(group)}
            />
            <div
              className={`w-3 h-3 rounded-full ${GROUP_COLORS[index % GROUP_COLORS.length]}`}
            />
            <Label
              htmlFor={`group-${group}`}
              className="text-sm font-medium cursor-pointer"
            >
              {group}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export { GROUP_COLORS };
