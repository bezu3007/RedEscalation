import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Sparkles, Loader2, UserCheck } from "lucide-react";
import { useUpdateCase } from "../hooks/useCases";

interface Props {
  caseId: number;
  onAssigned?: (developerId: string, developerName: string) => void;
}

export function DeveloperSuggester({ caseId, onAssigned }: Props) {
  const [suggestions, setSuggestions] = useState
    Awaited<ReturnType<typeof casesApi.aiSuggestDevelopers>>["suggestions"]
  >([]);

  const { mutate: suggest, isPending: isSuggesting } = useMutation({
    mutationFn: () => casesApi.aiSuggestDevelopers(caseId),
    onSuccess: (data) => setSuggestions(data.suggestions),
  });

  const { mutate: assignDev, isPending: isAssigning } = useUpdateCase();

  const handleAssign = (devId: string, devName: string) => {
    assignDev(
      { id: caseId, body: { assignedDeveloperId: devId } },
      { onSuccess: () => onAssigned?.(devId, devName) }
    );
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => suggest()}
        disabled={isSuggesting}
        className="gap-2"
      >
        {isSuggesting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-500" />
        )}
        Suggest Developers (AI)
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            AI Suggestions
          </p>
          {suggestions.map(({ developer, score, reason }) => (
            <div
              key={developer.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{developer.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(score * 100)}% match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{developer.department}</p>
                <p className="text-xs text-muted-foreground italic">{reason}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={isAssigning}
                onClick={() => handleAssign(developer.id, developer.name)}
                className="shrink-0 gap-1"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Assign
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}