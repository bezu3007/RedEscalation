import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "../api/casesApi";
import { Button } from "@/shared/components/ui/button";
import { Paperclip, X, FileText, Loader2 } from "lucide-react";
import { CASES_KEY } from "../hooks/useCases";

interface Props {
  caseId: number;
  existingUrl?: string | null;
}

export function AttachmentUploader({ caseId, existingUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (file: File) => casesApi.uploadAttachment(caseId, file),
    onSuccess: (data) => {
      setPreview(data.url);
      qc.invalidateQueries({ queryKey: [CASES_KEY, caseId] });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx"
        onChange={handleChange}
      />

      {preview ? (
        <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <a
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline underline-offset-2 truncate flex-1"
          >
            View Attachment
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setPreview(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {isPending ? "Uploading…" : "Attach File"}
        </Button>
      )}
    </div>
  );
}