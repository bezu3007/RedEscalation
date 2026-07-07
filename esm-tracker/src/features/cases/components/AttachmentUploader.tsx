import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import type { AttachmentFile } from "../hooks/useAttachment";

interface Props {
  files: AttachmentFile[];
  addFiles: (files: FileList | null) => void;
  removeFile: (id: string) => void;
  disabled?: boolean;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

export function AttachmentUploader({
  files,
  addFiles,
  removeFile,
  disabled = false,
  maxFileSize = 10, // default 10MB
  acceptedTypes = ["*/*"]
}: Props) {
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
    if (files.length === 0) {
      setSelectedFile(null);
    }
  }, [files, selectedFile]);

  const handleFileUpload = (fileList: FileList | null) => {
    setError(null);
    
    if (!fileList) return;
    
    // Validate file sizes
    const oversizedFiles = Array.from(fileList).filter(
      file => file.size > maxFileSize * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the ${maxFileSize}MB size limit`);
      return;
    }
    
    // Validate file types if specific types are required
    if (acceptedTypes[0] !== "*/*") {
      const invalidFiles = Array.from(fileList).filter(
        file => !acceptedTypes.some(type => 
          file.type.match(type.replace("*", ".*"))
        )
      );
      
      if (invalidFiles.length > 0) {
        setError(`Some file types are not supported`);
        return;
      }
    }
    
    addFiles(fileList);
  };

  const canPreview = (file: AttachmentFile) => {
    const previewableTypes = [
      'image/',
      'application/pdf',
      'text/',
      'video/',
      'audio/'
    ];
    return previewableTypes.some(type => file.file.type.startsWith(type));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 min-h-[420px]">
      {/* LEFT PANEL */}
      <div className="rounded-2xl border bg-slate-50 p-4 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Storage File List
          </h3>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <label className={`block ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
          <input
            type="file"
            multiple
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={disabled}
          />

          <div className={`flex items-center justify-center gap-2 rounded-xl border border-dashed bg-violet-50 hover:bg-violet-100 transition-colors h-12 text-sm font-medium text-violet-700 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}>
            <Upload className="h-4 w-4" />
            Select Local File Attachment
            {maxFileSize && (
              <span className="text-xs text-slate-500 font-normal">
                (Max {maxFileSize}MB)
              </span>
            )}
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
                    {Math.round(file.file.size / 1024)} KB
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {file.file.type || "Unknown type"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  disabled={disabled}
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

        {/* FILE COUNT */}
        {files.length > 0 && (
          <div className="text-xs text-slate-500 text-center">
            {files.length} file{files.length > 1 ? 's' : ''} uploaded
          </div>
        )}
      </div>

      {/* RIGHT PREVIEW PANEL */}
      <div className="rounded-2xl border bg-white flex items-center justify-center min-h-[420px]">
        {files.length === 0 ? (
          <div className="text-center text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              Select an attachment on the left to preview contents here.
            </p>
          </div>
        ) : selectedFile ? (
          canPreview(selectedFile) ? (
            <div className="w-full h-full p-6">
              {selectedFile.file.type.startsWith('image/') ? (
                <img 
                  src={selectedFile.preview} 
                  alt={selectedFile.file.name}
                  className="w-full h-[400px] object-contain rounded-xl border"
                />
              ) : selectedFile.file.type.startsWith('video/') ? (
                <video 
                  controls 
                  className="w-full h-[400px] rounded-xl border"
                  src={selectedFile.preview}
                />
              ) : selectedFile.file.type.startsWith('audio/') ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <FileText className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-lg font-medium">{selectedFile.file.name}</p>
                  <audio controls className="mt-4 w-full max-w-md" src={selectedFile.preview} />
                </div>
              ) : (
                <iframe
                  src={selectedFile.preview}
                  className="w-full h-[400px] rounded-xl border"
                  title={selectedFile.file.name}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                Preview not available for this file type
              </p>
              <p className="text-xs mt-1">{selectedFile.file.name}</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}