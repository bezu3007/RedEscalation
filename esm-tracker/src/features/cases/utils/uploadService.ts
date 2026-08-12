import axios from 'axios';
import { apiClient } from '@/shared/lib/apiClient';

export interface FtpUploadRequest {
  subDirectory: string;
  file: File;
}

export interface ResponseModel<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export const uploadFileToFtp = async (
  file: File,
  subDirectory: string = ''
): Promise<ResponseModel<string>> => {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('SubDirectory', subDirectory);

  try {
    const response = await apiClient.post<ResponseModel<string>>(
      '/CommonLibrary/upload_ftp_file',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'Upload failed',
        errors: error.response?.data?.errors || [error.message],
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred',
      errors: [(error as Error).message],
    };
  }
};