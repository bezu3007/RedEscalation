import { useState } from "react";
import { uploadFileToFtp, type ResponseModel } from "../utils/uploadService";
import { casesApi } from "../api/casesApi";
import type { AttachmentDTO } from "../types";

export interface AttachmentFile {
  id: string;
  attachmentId?: number;
  file?: File;
  preview?: string;
  description?: string;
  url?: string;
  isExisting?: boolean;
  isDeleted?: boolean; // We'll keep this flag but won't actually delete
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadResult?: string;
  uploadError?: string;
}

export function useAttachment() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
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
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        // Only revoke if it's a new file with a preview
        if (!fileToRemove.isExisting && fileToRemove.preview) {
          URL.revokeObjectURL(fileToRemove.preview);
        }
        // Mark existing files as deleted (for UI purposes only)
        if (fileToRemove.isExisting) {
          return prev.map(f => 
            f.id === id ? { ...f, isDeleted: true } : f
          );
        }
        return prev.filter((f) => f.id !== id);
      }
      return prev;
    });
  };

  // Restore a previously removed file
  const restoreFile = (id: string) => {
    setFiles((prev) =>
      prev.map(f => 
        f.id === id ? { ...f, isDeleted: false } : f
      )
    );
  };

  const reset = () => {
    files.forEach((f) => {
      if (!f.isExisting && f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
    setLoaded(false);
  };

  const uploadSingleFile = async (
    id: string,
    subDirectory: string = ''
  ): Promise<ResponseModel<string>> => {
    console.log("Uploading single file with id:", id, "to subDirectory:", subDirectory);
    const fileEntry = files.find(f => f.id === id);
    if (!fileEntry || !fileEntry.file) {
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

      console.log("Upload result for file id", id, ":", result);

      const isFinalSuccess = result.success;

      setFiles(prev =>
        prev.map(f =>
          f.id === id
            ? {
                ...f,
                uploadStatus: isFinalSuccess ? 'success' : 'error',
                uploadResult: result.success ? result.data : undefined,
                uploadError: isFinalSuccess ? undefined : result.message,
              }
            : f
        )
      );

      return {
        success: isFinalSuccess,
        message: result.message,
        data: result.data,
        errors: result.errors,
      };
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

    const uploadPromises = files
      .filter(f => !f.isExisting && f.file && !f.isDeleted) // Only upload new files that aren't deleted
      .map(file => uploadSingleFile(file.id, subDirectory));
    
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

  const loadAttachments = async (caseId: number) => {
    try {
      console.log("Loading attachments for caseId:", caseId);
      const attachments = await casesApi.getAttachments(caseId);

      const mapped = attachments.map(a => ({
        id: crypto.randomUUID(),
        attachmentId: a.id,
        description: a.description,
        url: a.url,
        isExisting: true,
        isDeleted: false,
        uploadStatus: "success" as const,
        // Create a fake file object for display purposes
        file: new File([], a.description || a.url || 'attachment'),
        // Use the URL as preview for existing files
        preview: a.url,
      }));

      setFiles(mapped);
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load attachments:", err);
    }
  };

  const persistAttachments = async (caseId: number) => {
    const successfulUploads = files.filter(f => f.uploadResult && !f.isExisting && !f.isDeleted);

    for (const fileEntry of successfulUploads) {
      const attachment: AttachmentDTO = {
        id: 0,
        reference: caseId,
        category: 1451,
        description: fileEntry.file?.name || fileEntry.description || "Attachment",
        url: fileEntry.uploadResult!,
        type: 1461,
        index: 0,
        pointer: 767,
        isActive: true,
        remark: "400",
      };

      try {
        await casesApi.createAttachment(attachment);
        console.log("Attachment created successfully:", fileEntry.file?.name);
      } catch (err) {
        console.error("Failed to persist attachment:", err);
      }
    }
  };
  
  const updateAttachments = async (caseId: number) => {
    console.log("Updating attachments for caseId:", caseId);
    
    // Handle new file uploads
    const newFiles = files.filter(f => !f.isExisting && f.uploadResult && !f.isDeleted);
    for (const fileEntry of newFiles) {
      const attachment: AttachmentDTO = {
        id: 0, // New attachment
        reference: caseId,
        category: 1451,
        description: fileEntry.file?.name || "Attachment",
        url: fileEntry.uploadResult!,
        type: 1461,
        index: 0,
        pointer: 767,
        isActive: true,
        remark: "400",
      };

      console.log("Creating new attachment for file:", fileEntry.file?.name, "with data:", attachment);

      try {
        await casesApi.createAttachment(attachment);
        console.log("New attachment created:", fileEntry.file?.name);
      } catch (err) {
        console.error("Failed to create new attachment:", err);
      }
    }

    const deletedFiles = files.filter(f => f.isExisting && f.isDeleted);
    if (deletedFiles.length > 0) {
      console.log("Files marked for deletion (no delete endpoint available):", 
        deletedFiles.map(f => f.description));
    }
  };

  const hasAttachmentChanges = () => {
    // Check if there are new files or files marked for deletion
    const hasNewFiles = files.some(f => !f.isExisting);
    const hasDeletedFiles = files.some(f => f.isExisting && f.isDeleted);
    return hasNewFiles || hasDeletedFiles;
  };

  // Get only active files (not marked as deleted)
  const getActiveFiles = () => {
    return files.filter(f => !f.isDeleted);
  };

  return {
    files,
    loaded,
    addFiles,
    removeFile,
    restoreFile,
    reset,
    uploadSingleFile,
    uploadAllFiles,
    getUploadStatus,
    uploading,
    setUploading,
    persistAttachments,
    updateAttachments,
    loadAttachments,
    hasAttachmentChanges,
    getActiveFiles,
  };
}