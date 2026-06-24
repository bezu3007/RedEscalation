import { useState } from "react";

export interface AttachmentFile {
  id: string;
  file: File;
  preview: string;
}

export function useAttachment() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const mapped = Array.from(newFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  return {
    files,
    addFiles,
    removeFile,
    reset,
  };
}