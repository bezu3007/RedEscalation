import { useState } from "react";
import { uploadFileToFtp, type ResponseModel } from "../utils/uploadService";
import { casesApi } from "../api/casesApi";
import { getMimeType } from "../utils/mimeTypeUtils";
import type { AttachmentDTO } from "../types";
import { generateUUID } from "../utils/generateUUID";

export interface AttachmentFile {
  id: string;
  attachmentId?: number;
  file?: File;
  preview?: string;
  description?: string;
  url?: string;
  isExisting?: boolean;
  isDeleted?: boolean; 
  mimeType?: string;
  fileName?: string; 
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadResult?: string;
  uploadError?: string;
}

export function useAttachment() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  console.log("attachment files: ", files);
  const downloadFile = async (file: AttachmentFile) => {
    if (!file.url) return;

    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.file?.name ?? file.description ?? "attachment";
    a.target = "_blank";
    a.click();
  };

  const addFiles = (newFiles: FileList | null) => {
    console.log("Aaaaaaaaaaaaaaaaaaaaaadding new files:", newFiles);
    if (!newFiles) return;

    const mapped = Array.from(newFiles).map((file) => ({
      id: generateUUID(),
      file,
      preview: URL.createObjectURL(file),
      uploadStatus: 'idle' as const,
    }));

    console.log("Mmmmmmmmmmmmmmmmmmmapped files to add:", mapped);

    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);

      if (!file) return prev;

      if (file.isExisting) {
        return prev.map((f) =>
          f.id === id
            ? { ...f, isDeleted: true }
            : f
        );
      }

      if (file.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(file.preview);
      }

      return prev.filter((f) => f.id !== id);
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
    console.log("Uuuuuuuuuuuuuuuuuuuuuuploading all files to subDirectory:", subDirectory);

    const uploadPromises = files
      .filter(f => !f.isExisting && f.file && !f.isDeleted) // Only upload new files that aren't deleted
      .map(file => uploadSingleFile(file.id, subDirectory));
    
    setUploading(true);
    const results = await Promise.all(uploadPromises);
    setUploading(false);

    const allSuccess = results.every(r => r.success);
    console.log("Fffffffffffffffffiles saved in subdirectory:", subDirectory, "with results:", results);
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

  const previewAttachment = async (file: AttachmentFile): Promise<string | undefined> => {
    if (!file.isExisting || !file.url) {
      return file.preview || file.url;
    }

    try {
      console.log("Previewing attachment for file:", file);
      const previewResult = await casesApi.getAttachmentPreview(file.url);
      const resolvedPreview = typeof previewResult === "string" && previewResult.trim()
        ? previewResult
        : file.preview || file.url;

      setFiles((prev) =>
        prev.map((item) =>
          item.id === file.id
            ? { ...item, preview: resolvedPreview }
            : item
        )
      );

      return resolvedPreview;
    } catch (error) {
      console.error("Failed to preview attachment:", error);
      return file.preview || file.url;
    }
  };

  const loadAttachments = async (caseId: number) => {
    try {
        console.log("Loading attachments for caseId:", caseId);
        const attachments = await casesApi.getAttachments(caseId);
        console.log("Loaded attachments:", attachments);

        // const previewAttachment = await casesApi.getAttachmentPreview(attachments[0]?.url || '');

        const mapped = attachments.map(a => {
            const mimeType = getMimeType(a.url);
            // const previewFile = "ftp://192.168.1.8:21" + a.url;

            console.log(`Attachment URL: ${a.url}, Preview File: ${a.url}, MIME Type: ${mimeType}`); // Debug log
            console.log(`File: ${a.description}, MIME: ${mimeType}`); // Debug log
            
            return {
                id: generateUUID(),
                attachmentId: a.id,
                description: a.description,
                url: a.url,
                mimeType: mimeType,
                isExisting: true,
                isDeleted: false,
                uploadStatus: "success" as const,
                file: new File([], a.description || a.url || 'attachment'),
                preview: a.url,
            };
        });

        setFiles(mapped);
        setLoaded(true);
    } catch (err) {
        console.error("Failed to load attachments:", err);
    }
};

  const persistAttachments = async (caseId: number) => {
    const successfulUploads = files.filter(f => f.uploadResult && !f.isExisting && !f.isDeleted);

    for (const fileEntry of successfulUploads) {
      // const ftpUrl = fileEntry.uploadResult;
      const url = fileEntry.uploadResult;

      console.log("Persisting attachment for file:", fileEntry.file?.name, "with upload result:", fileEntry.uploadResult);
      console.log("Computed URL for attachment:", url);
      const attachment: AttachmentDTO = {
        id: 0,
        reference: caseId,
        category: 1451,
        description: fileEntry.file?.name || fileEntry.description || "Attachment",
        url: url || fileEntry.uploadResult || "",
        type: 1461,
        index: 0,
        pointer: 767,
        isActive: true,
        remark: "400",
      };

      try {
        await casesApi.createAttachment(attachment);
        console.log("Attachment created successfully:", fileEntry.file?.name);
        console.log("Attachment data sent to API:", attachment);
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

    const deletedFiles = files.filter(
        f => f.isExisting && f.isDeleted && f.attachmentId
    );

    for (const file of deletedFiles) {
        try {
            await casesApi.deleteAttachment(file.attachmentId!);
        } catch (err) {
            console.error(
                "Failed to delete attachment:",
                file.attachmentId,
                err
            );
        }
    }
  };

  const hasAttachmentChanges = () => {
    return files.some(
        f => !f.isExisting || f.isDeleted
    );
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
    downloadFile,
    getUploadStatus,
    uploading,
    setUploading,
    persistAttachments,
    updateAttachments,
    loadAttachments,
    previewAttachment,
    hasAttachmentChanges,
    getActiveFiles,
  };
}