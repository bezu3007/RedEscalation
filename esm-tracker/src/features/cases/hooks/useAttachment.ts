import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/lib/apiClient';

export interface AttachmentFile {
  id: string;
  file: File;
  preview: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
  serverUrl?: string;
}

export interface AttachmentDTO {
  reference: number;
  category: number;
  description: string;
  url: string;
  type: number;
  index: number;
  isActive: boolean;
  remark: string;
  id?: number;
}

const debug = {
  log: (message: string, data?: any) => {
    console.log(`🔍 [Attachment Debug] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [Attachment Error] ${message}`, error || '');
  },
  success: (message: string, data?: any) => {
    console.log(`✅ [Attachment Success] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    console.info(`ℹ️ [Attachment Info] ${message}`, data || '');
  }
};

export function useAttachment() {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  const addFiles = (newFiles: FileList | null) => {
    debug.log('Adding new files', { count: newFiles?.length });
    if (!newFiles) return;

    // const mapped = Array.from(newFiles).map((file) => ({
    //   id: crypto.randomUUID(),
    //   file,
    //   preview: URL.createObjectURL(file),
    //   uploadStatus: 'pending' as const,
    // }));

    const mapped = Array.from(newFiles).map((file) => {
      debug.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      
      return {
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploadStatus: 'pending' as const,
      };
    });

    setFiles((prev) => [...prev, ...mapped]);
    debug.success(`Added ${mapped.length} files`);
  };

  const removeFile = (id: string) => {
    debug.log('Removing file', { id });
    setFiles((prev) => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
        debug.log('Revoked preview URL for file', { name: file.file.name });
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const reset = () => {
    debug.log('Resetting all attachments');
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setIsUploading(false);
  };

  // Upload files to server
  const uploadFiles = useCallback(async (
    referenceId: string | number,
    category: number = 1451,
    type: number = 1461,
    remark: string = '400'
  ): Promise<{ success: boolean; message: string; uploadedFiles?: AttachmentDTO[] }> => {

    debug.log('Starting upload process', { 
      referenceId, 
      category, 
      type, 
      remark,
      totalFiles: files.length,
      pendingFiles: files.filter(f => f.uploadStatus === 'pending').length
    });

    if (files.length === 0) {
      debug.error('No files to upload');
      return { success: false, message: 'No files to upload.' };
    }

    setIsUploading(true);
    const uploadedAttachments: AttachmentDTO[] = [];
    const pendingFiles = files.filter(f => f.uploadStatus === 'pending');

    if (pendingFiles.length === 0) {
      debug.info('No pending files to upload');
      setIsUploading(false);
      return { success: true, message: 'All files already uploaded' };
    }

    debug.log(`Uploading ${pendingFiles.length} files`);

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileData = pendingFiles[i];
        debug.log(`Processing file ${i + 1}/${pendingFiles.length}`, {
          name: fileData.file.name,
          size: fileData.file.size
        });

        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, uploadStatus: 'uploading' as const } : f
        ));

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('reference', referenceId.toString());
        formData.append('category', category.toString());
        formData.append('type', type.toString());
        formData.append('remark', remark);
        formData.append('description', fileData.file.name);

        // Log form data contents
        debug.log('FormData contents:', {
          file: fileData.file.name,
          reference: referenceId.toString(),
          category: category.toString(),
          type: type.toString(),
          remark: remark,
          description: fileData.file.name
        });

        try {
          debug.log('Sending upload request to /Attachment/upload');

          // Upload to your backend API
          const response = await apiClient.post('/Attachment/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          debug.log('Upload response received:', response.data);

          if (response.data.success) {
            const attachment: AttachmentDTO = response.data.attachment;
            debug.success(`File uploaded successfully: ${fileData.file.name}`, attachment);

            uploadedAttachments.push(attachment);
            
            // Update file status
            // setFiles(prev => prev.map(f => 
            //   f.id === fileData.id ? { 
            //     ...f, 
            //     uploadStatus: 'success' as const,
            //     serverUrl: attachment.url 
            //   } : f
            // ));

            // Save to upload history
            setUploadHistory(prev => [...prev, {
              fileName: fileData.file.name,
              referenceId,
              attachment,
              timestamp: new Date().toISOString()
            }]);

          } else {
            debug.error('Upload failed - server returned error', response.data);
            throw new Error(response.data.message || 'Upload failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          debug.error(`Failed to upload ${fileData.file.name}`, { error, errorMessage });

          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { 
              ...f, 
              uploadStatus: 'error' as const,
              uploadError: errorMessage 
            } : f
          ));
          
          return { 
            success: false, 
            message: `Failed to upload ${fileData.file.name}: ${errorMessage}`,
            uploadedFiles: uploadedAttachments 
          };
        }
      }

      debug.success('All files uploaded successfully', { 
        count: uploadedAttachments.length,
        files: uploadedAttachments.map(a => a.description)
      });

      return { 
        success: true, 
        message: 'All files uploaded successfully',
        uploadedFiles: uploadedAttachments 
      };
    } finally {
      setIsUploading(false);
      debug.log('Upload process completed');
    }
  }, [files]);

  // Retrieve attachments for a reference
  const getAttachments = useCallback(async (referenceId: number): Promise<AttachmentDTO[]> => {
    debug.log('Fetching attachments for reference', { referenceId });

    try {
      const response = await apiClient.get(`/Attachment/filter`, {
        params: { Reference: referenceId }
      });
      
      debug.success(`Retrieved ${response.data?.length || 0} attachments`, response.data);

      return response.data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }, []);

   // Debug method to log current state
  const debugState = useCallback(() => {
    debug.info('Current state:', {
      totalFiles: files.length,
      pending: files.filter(f => f.uploadStatus === 'pending').length,
      uploading: files.filter(f => f.uploadStatus === 'uploading').length,
      success: files.filter(f => f.uploadStatus === 'success').length,
      error: files.filter(f => f.uploadStatus === 'error').length,
      isUploading,
      uploadHistory: uploadHistory.length
    });
    
    files.forEach((f, index) => {
      debug.log(`File ${index + 1}:`, {
        name: f.file.name,
        status: f.uploadStatus,
        size: f.file.size,
        serverUrl: f.serverUrl || 'N/A'
      });
    });
  }, [files, isUploading, uploadHistory]);

  return {
    files,
    addFiles,
    removeFile,
    reset,
    uploadFiles,
    getAttachments,
    isUploading,
    debugState,
    uploadHistory,
  };
}