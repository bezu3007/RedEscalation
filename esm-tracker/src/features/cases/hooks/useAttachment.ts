import { useState } from "react";
import { uploadFileToFtp, type ResponseModel } from "../utils/uploadService";

export interface AttachmentFile {
  id: string;
  file: File;
  preview: string;
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadResult?: string;
  uploadError?: string;
}

export function useAttachment() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  console.log("attachment files: ", files);

  const addFiles = (newFiles: FileList | null) => {

    console.log("Adding new files:", newFiles);
    if (!newFiles) return;

    const mapped = Array.from(newFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      uploadStatus: 'idle' as const,
    }));

    console.log("Mapped files to add:", mapped);

    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f=> f.id === id);
      if(fileToRemove){
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  const uploadSingleFile = async (
    id: string,
    subDirectory: string = ''
  ): Promise<ResponseModel<string>> => {

    console.log("Uploading single file with id:", id, "to subDirectory:", subDirectory);
    const fileEntry = files.find(f => f.id === id);
    if (!fileEntry) {
      return {
        success: false,
        message: 'File not found',
      };
    }

    // Update status to uploading
    setFiles(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, uploadStatus: 'uploading' as const }
          : f
      )
    );

    try {
      const result = await uploadFileToFtp(fileEntry.file, subDirectory);
      console.log("test");
      console.log("resulttttttttttttttt: ", result);
      
      // Update status based on result
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                uploadStatus: result.success ? 'success' : 'error',
                uploadResult: result.data,
                uploadError: result.success ? undefined : result.message,
              }
            : f
        )
      );

      return result;
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                uploadStatus: 'error' as const,
                uploadError: (error as Error).message,
              }
            : f
        )
      );
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  };

  const uploadAllFiles = async (
    subDirectory: string = ''
  ): Promise<{ success: boolean; results: ResponseModel<string>[] }> => {
    console.log("Uploading all files to subDirectory:", subDirectory);

    const uploadPromises = files.map(file => 
      uploadSingleFile(file.id, subDirectory)
    );
    
    setUploading(true);
    const results = await Promise.all(uploadPromises);
    setUploading(false);

    const allSuccess = results.every(r => r.success);
    return {
      success: allSuccess,
      results,
    };
  };

  const getUploadStatus = (id: string): AttachmentFile['uploadStatus'] => {
    console.log("Getting upload status for file with id:", id);
    const file = files.find(f => f.id === id);
    return file?.uploadStatus || 'idle';
  };

  return {
    files,
    addFiles,
    removeFile,
    reset,
    uploadSingleFile,
    uploadAllFiles,
    getUploadStatus,
    uploading,
    setUploading,
  };
}