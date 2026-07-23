import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { AttachmentFile } from "../hooks/useAttachment";

interface Props {
  files: AttachmentFile[];
  addFiles: (files: FileList | null) => void;
  removeFile: (id: string) => void;
  uploadSingleFile?: (id: string, subDirectory?: string) => Promise<any>;
  uploadAllFiles?: (subDirectory?: string) => Promise<any>;
  disabled?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
  subDirectory?: string;
  showUploadButtons?: boolean;
}

export function AttachmentUploader({
  files,
  addFiles,
  removeFile,
  uploadSingleFile,
  uploadAllFiles,
  disabled = false,
  maxFileSize = 10,
  acceptedTypes = ["*/*"],
  subDirectory = "",
  showUploadButtons = true,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log(files.length, "files length");
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
    if (files.length === 0) {
      setSelectedFile(null);
    }
  }, [files, selectedFile]);

  const handleFileUpload = (fileList: FileList | null) => {
    console.log("Handling file upload with fileList:", fileList);
    setError(null);
    
    if (!fileList) return;
    
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

  const handleUploadSingle = async (file: AttachmentFile) => {
    console.log("Handling single file upload for file:", file, "to subDirectory:", subDirectory);

    if (!uploadSingleFile) return;
    const result = await uploadSingleFile(file.id, subDirectory);
    if (!result.success) {
      setError(`Upload failed: ${result.message}`);
    }
  };

  const handleUploadAll = async () => {
    console.log("Handling upload for all files to subDirectory:", subDirectory);
    
    if (!uploadAllFiles) return;
    setUploading(true);
    const result = await uploadAllFiles(subDirectory);
    setUploading(false);
    if (!result.success) {
      setError('Some files failed to upload');
    }
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

  const getStatusIcon = (status?: AttachmentFile['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: AttachmentFile['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
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

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <label className={`block ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
          <input
            type="file"
            multiple
            className="hidden"
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={disabled || uploading}
          />

          <div className={`flex items-center justify-center gap-2 rounded-xl border border-dashed bg-violet-50 hover:bg-violet-100 transition-colors h-12 text-sm font-medium text-violet-700 ${
            disabled || uploading ? 'cursor-not-allowed' : 'cursor-pointer'
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

        {showUploadButtons && files.length > 0 && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUploadAll}
              disabled={uploading || disabled}
              className="flex-1"
              size="sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>
        )}

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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.round(file.file.size / 1024)} KB
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {file.file.type || "Unknown type"}
                  </p>
                  {file.uploadStatus && (
                    <div className={`flex items-center gap-1 text-xs ${getStatusColor(file.uploadStatus)}`}>
                      {getStatusIcon(file.uploadStatus)}
                      <span className="capitalize">{file.uploadStatus}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {showUploadButtons && uploadSingleFile && file.uploadStatus !== 'success' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={file.uploadStatus === 'uploading' || disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadSingle(file);
                      }}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    disabled={disabled || file.uploadStatus === 'uploading'}
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
              </div>
            ))
          )}
        </div>

        {files.length > 0 && (
          <div className="text-xs text-slate-500 text-center">
            {files.length} file{files.length > 1 ? 's' : ''} 
            {files.some(f => f.uploadStatus === 'success') && (
              <> • {files.filter(f => f.uploadStatus === 'success').length} uploaded</>
            )}
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