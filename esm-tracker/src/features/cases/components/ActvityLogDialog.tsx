import { useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Clock3, Monitor, User } from "lucide-react";
import { useActivityLog } from "../hooks/useCases";
import { mapIdToStatus} from "../utils/statusMapping";

interface Props {
  open: boolean;
  caseId?: number;
  caseNumber?: string;
  onClose: () => void;
}

export function ActivityLogDialog({
  open,
  caseId,
  caseNumber,
  onClose,
}: Props) {
  const { data = [], isLoading } = useActivityLog(caseId!, open);

  useEffect(() => {
    if (!open) return;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl">

        <div className="bg-slate-900 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">
            Activity Log
          </h2>

          <p className="text-sm text-slate-300">
            {caseNumber}
          </p>
        </div>

        <ScrollArea className="max-h-[600px] p-6">

          {isLoading && (
            <div className="text-center py-8">
              Loading...
            </div>
          )}

          {!isLoading && data.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No activity found.
            </div>
          )}

          <div className="space-y-4">
            {data.map((item) => (
                
              <div
                key={item.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">

                  <Badge>
                    {mapIdToStatus(item.activityDefinition)}
                  </Badge>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock3 className="w-4 h-4" />
                    {new Date(item.timeStamp).toLocaleString()}
                  </div>

                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                        <User className="h-4 w-4 text-slate-500" />
                        {item.userName}
                    </div>

                    <div className="flex items-center">
                        <Monitor className="h-4 w-4 text-slate-500" />
                        {item.platform}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    
                  <div>
                    <span className="font-medium">
                      Organization:
                    </span>{" "}
                    {item.organizationUnitDefnDesc}
                  </div>

                </div>

                {item.remark && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                    {item.remark}
                  </div>
                )}
              </div>
            ))}
          </div>

        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
}