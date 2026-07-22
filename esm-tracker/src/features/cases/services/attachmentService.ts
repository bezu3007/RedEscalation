import { apiClient } from '@/shared/lib/apiClient';
import { AttachmentDTO } from '../hooks/useAttachment';

export const attachmentService = {
  // Upload file to FTP and create attachment record
  uploadAttachment: async (
    file: File,
    reference: number,
    category: number = 1451,
    type: number = 1461,
    remark: string = '400'
  ): Promise<{ success: boolean; attachment?: AttachmentDTO; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reference', reference.toString());
      formData.append('category', category.toString());
      formData.append('type', type.toString());
      formData.append('remark', remark);
      formData.append('description', file.name);

      const response = await apiClient.post('/Attachment/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  },

  // Get attachments by reference
  getAttachmentsByReference: async (referenceId: number): Promise<AttachmentDTO[]> => {
    try {
      const response = await apiClient.get('/Attachment/filter', {
        params: { Reference: referenceId }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  },

  // Delete attachment
  deleteAttachment: async (attachmentId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/Attachment/${attachmentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  },

  // Update attachment
  updateAttachment: async (attachment: AttachmentDTO): Promise<AttachmentDTO | null> => {
    try {
      const response = await apiClient.put('/Attachment', attachment);
      return response.data;
    } catch (error) {
      console.error('Error updating attachment:', error);
      return null;
    }
  },

  // Download attachment
  downloadAttachment: async (url: string): Promise<Blob | null> => {
    try {
      const response = await apiClient.get(`/Attachment/download`, {
        params: { url },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      return null;
    }
  }
};