import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import type { AttachmentFile } from "../hooks/useAttachment";

interface Props {
  files: AttachmentFile[];

  addFiles: (files: FileList | null) => void;

  removeFile: (id: string) => void;
}

export function AttachmentUploader({files, addFiles, removeFile,}: Props) {

  const [selectedFile, setSelectedFile] =useState<AttachmentFile | null>(null);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
    if (files.length === 0) {
      setSelectedFile(null);
    }
  }, [files, selectedFile]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 min-h-[420px]">
      {/* LEFT PANEL */}
      <div className="rounded-2xl border bg-slate-50 p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Storage File List
          </h3>
        </div>

        {/* UPLOAD BUTTON */}
        <label className="block">
          <input
            type="file"
            multiple
            className="hidden"
            accept="*/*"
            onChange={(e) =>
              addFiles(e.target.files)
            }
          />

          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer h-12 text-sm font-medium text-violet-700">
            <Upload className="h-4 w-4" />

            Select Local File Attachment
          </div>
        </label>

        {/* FILE LIST */}
        <div className="rounded-xl border bg-white min-h-[250px] p-2 space-y-2 overflow-auto">
          {files.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-sm">
              <FileText className="h-8 w-8 mb-2 opacity-40" />

              No storage files registered.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`flex items-start justify-between gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedFile?.id === file.id
                    ? "bg-violet-50 border-violet-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {Math.round(
                      file.file.size / 1024
                    )}{" "}
                    KB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (selectedFile?.id === file.id) {
                      setSelectedFile(null);
                    }

                    removeFile(file.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW PANEL */}
      <div className="rounded-2xl border bg-white flex items-center justify-center min-h-[420px]">
        {files.length === 0 ? (
          <div className="text-center text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />

            <p className="text-sm">
              Select an attachment on the left to
              preview contents here.
            </p>
          </div>
        ) : (
          <div className="w-full h-full p-6">
            <iframe
              src={selectedFile?.preview}
              className="w-full h-[400px] rounded-xl border"
            />
          </div>
        )}
      </div>
    </div>
  );
}