import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { Upload, Download, FileText, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import type { AttachmentFile } from "../hooks/useAttachment";
import * as XLSX from 'xlsx';

interface Props {
  files: AttachmentFile[];
  addFiles: (files: FileList | null) => void;
  removeFile: (id: string) => void;
  uploadSingleFile?: (id: string, subDirectory?: string) => Promise<any>;
  uploadAllFiles?: (subDirectory?: string) => Promise<any>;
  downloadFile?: (file: AttachmentFile) => Promise<void>;
  caseId?: number | null;
  disabled?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
  subDirectory?: string;
  showUploadButtons?: boolean;
  previewFile?: (file: AttachmentFile) => Promise<string | undefined> | string | undefined;
  open?: boolean;
}

// Define the Excel data type
interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined;
}

export function AttachmentUploader({
  files,
  addFiles,
  removeFile,
  uploadAllFiles,
  downloadFile,
  disabled = false,
  maxFileSize = 10,
  acceptedTypes = ["*/*"],
  subDirectory = "",
  showUploadButtons = true,
  previewFile,
  open = false,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<AttachmentFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [excelData, setExcelData] = useState<ExcelRow[] | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  useEffect(() => {
    const loadFirstPreview = async () => {
      if (!open || files.length === 0) {
        if (files.length === 0) {
          setSelectedFile(null);
          setExcelData(null);
        }
        return;
      }

      if (!selectedFile) {
        void handleSelectFile(files[0]);
      }
    };

    void loadFirstPreview();
  }, [open, files, selectedFile, previewFile]);

  // Handle Excel file loading
  useEffect(() => {
    if (!selectedFile) {
      setExcelData(null);
      setExcelError(null);
      return;
    }

    const isExcel = isExcelFile(selectedFile);
    if (!isExcel) {
      setExcelData(null);
      setExcelError(null);
      return;
    }

    setExcelLoading(true);
    setExcelError(null);

    const loadExcel = async () => {
      try {
        // console.log('📊 Loading Excel file:', {
        //   name: selectedFile.file?.name || selectedFile.description || selectedFile.url,
        //   hasFile: !!selectedFile.file,
        //   hasUrl: !!selectedFile.url,
        //   hasPreview: !!selectedFile.preview,
        //   mimeType: selectedFile.file?.type || selectedFile.mimeType,
        //   isExisting: selectedFile.isExisting,
        //   fileSize: selectedFile.file?.size,
        //   url: selectedFile.url
        // });

        let arrayBuffer: ArrayBuffer | null = null;

        const isExistingFile = selectedFile.isExisting === true;
        
        if (isExistingFile && selectedFile.url) {
          let fullUrl = selectedFile.url;
          
          if (fullUrl.startsWith('/')) {
            fullUrl = `/api/attachments/download?path=${encodeURIComponent(fullUrl)}`;
          } else if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            fullUrl = `/api/attachments/download?path=${encodeURIComponent(fullUrl)}`;
          }
          
          try {
            const response = await fetch(fullUrl, {
              credentials: 'include',
              headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream'
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
              const text = await response.text();
              console.error('❌ Received HTML:', text.substring(0, 200));
              throw new Error('Server returned HTML instead of Excel file. The file may not be accessible.');
            }
            
            arrayBuffer = await response.arrayBuffer();
            
            if (arrayBuffer.byteLength === 0) {
              throw new Error('File is empty (0 bytes)');
            }
          } catch (err) {
            // console.error('❌ Error fetching from URL:', err);
            // Try the preview URL as fallback
            if (selectedFile.preview && selectedFile.preview !== selectedFile.url) {
              try {
                const response = await fetch(selectedFile.preview, {
                  credentials: 'include'
                });
                if (response.ok) {
                  arrayBuffer = await response.arrayBuffer();
                }
              } catch (previewErr) {
                // console.error('❌ Error fetching from preview URL:', previewErr);
              }
            }
            
            if (!arrayBuffer) {
              // throw new Error(`Failed to fetch Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }
        }
        // For NEW files: Read from File object
        else if (selectedFile.file && selectedFile.file.size > 0) {
          arrayBuffer = await selectedFile.file.arrayBuffer();
        }
        // Fallback: try preview URL if available
        else if (selectedFile.preview && selectedFile.preview.startsWith('blob:')) {
          try {
            const response = await fetch(selectedFile.preview);
            if (response.ok) {
              arrayBuffer = await response.arrayBuffer();
            }
          } catch (err) {
            console.error('❌ Error fetching from preview:', err);
          }
        }

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('Could not load Excel file data (file is empty or inaccessible)');
        }

        // Parse Excel with SheetJS
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error('No sheets found in the Excel file');
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Try standard parsing first
        let jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
        
        // If no data with standard parsing, try with headers: 1 (raw data)
        if (jsonData.length === 0) {
          const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as Array<Array<string | number | boolean | null | undefined>>;
          
          if (rawData && rawData.length > 0) {
            // Get headers from first row
            const headers = rawData[0].map((_, index: number) => `Column ${index + 1}`);
            // Get data rows (skip header row)
            const rows = rawData.slice(1);
            
            // Format the data with proper types
            const formattedData: ExcelRow[] = rows.map((row: Array<string | number | boolean | null | undefined>) => {
              const obj: ExcelRow = {};
              row.forEach((cell: string | number | boolean | null | undefined, index: number) => {
                const headerKey = headers[index] || `Column ${index + 1}`;
                obj[headerKey] = cell !== undefined && cell !== null ? cell : '';
              });
              return obj;
            });
            
            if (formattedData.length > 0) {
              console.log('📋 Headers (raw):', Object.keys(formattedData[0]));
            }
            setExcelData(formattedData);
            return;
          } else {
            throw new Error('No data found in the Excel sheet');
          }
        }
        
        setExcelData(jsonData);
      } catch (error) {
        // console.error('❌ Failed to load Excel file:', error);
        setExcelError(error instanceof Error ? error.message : 'Failed to load Excel file');
        setExcelData(null);
      } finally {
        setExcelLoading(false);
      }
    };

    loadExcel();
  }, [selectedFile]);

  const handleFileUpload = (fileList: FileList | null) => {
    setError(null);
    
    if (!fileList) return;
    
    const oversizedFiles = Array.from(fileList).filter(
      file => file.size > maxFileSize * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the ${maxFileSize}MB size limit`);
      return;
    }
    
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

  const isExcelFile = (file: AttachmentFile) => {
    const fileName = file.file?.name || file.description || file.url || '';
    const mimeType = file.file?.type || file.mimeType || '';
    
    const isExcel = (
      fileName.toLowerCase().endsWith('.xlsx') ||
      fileName.toLowerCase().endsWith('.xls') ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel" ||
      (file.url && file.url.toLowerCase().includes('.xlsx')) ||
      (file.url && file.url.toLowerCase().includes('.xls'))
    );
    
    return isExcel;
  };

  const handleUploadAll = async () => {
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
      "image/",
      "application/pdf",
      "text/",
      "video/",
      "audio/",
    ];

    const type = file.file?.type || file.mimeType || "";

    if (isExcelFile(file)) {
      return true;
    }

    return previewableTypes.some(previewType =>
      type.startsWith(previewType)
    );
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

  const previewType = selectedFile?.file?.type || selectedFile?.mimeType || "";
  const previewUrl = selectedFile?.preview || selectedFile?.url || "";

  const handleSelectFile = async (file: AttachmentFile) => {
    setSelectedFile(file);
    setExcelData(null);
    setExcelError(null);

    if (!previewFile) return;

    const resolvedPreview = await previewFile(file);
    if (resolvedPreview) {
      setSelectedFile((current) =>
        current?.id === file.id
          ? { ...current, preview: resolvedPreview }
          : current
      );
    }
  };

  const renderExcelPreview = () => {
    if (excelLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="mt-4 text-sm text-slate-500">Loading Excel file...</p>
        </div>
      );
    }

    if (excelError) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-sm text-red-600 font-medium">Error loading Excel file</p>
          <p className="text-xs text-slate-500 mt-2 max-w-md">{excelError}</p>
          <p className="text-xs text-slate-400 mt-4">
            File: {selectedFile?.file?.name || selectedFile?.description || selectedFile?.url}
          </p>
          <button
            onClick={() => {
              setExcelError(null);
              setExcelData(null);
              if (selectedFile) {
                const fileCopy = { ...selectedFile };
                setSelectedFile(null);
                setTimeout(() => setSelectedFile(fileCopy), 100);
              }
            }}
            className="mt-4 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm hover:bg-violet-200 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!excelData || excelData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
          <FileText className="h-16 w-16 mb-4 opacity-40" />
          <p className="text-sm">No data found in this Excel file</p>
          <p className="text-xs mt-1">{selectedFile?.file?.name || selectedFile?.description}</p>
        </div>
      );
    }

    // Type-safe way to get headers
    const firstRow = excelData[0];
    const headers = firstRow ? Object.keys(firstRow) : [];

    return (
      <div className="h-[400px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {selectedFile?.file?.name || selectedFile?.description}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{excelData.length} rows</span>
            <span>•</span>
            <span>{headers.length} columns</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-100">
              <tr>
                <th className="border px-3 py-2 text-left font-semibold text-slate-700 bg-slate-100 min-w-[40px]">
                  #
                </th>
                {headers.map((key) => (
                  <th key={key} className="border px-3 py-2 text-left font-semibold text-slate-700 bg-slate-100 min-w-[120px]">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(0, 100).map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                  <td className="border px-3 py-2 text-slate-500 font-mono text-xs text-center">
                    {rowIndex + 1}
                  </td>
                  {headers.map((key) => (
                    <td key={key} className="border px-3 py-2 text-slate-700 max-w-[300px] truncate">
                      {row[key] !== undefined && row[key] !== null && row[key] !== '' 
                        ? String(row[key]) 
                        : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {excelData.length > 100 && (
            <div className="text-center py-4 text-sm text-slate-500 bg-slate-50 border-t">
              Showing first 100 rows of {excelData.length} total rows
            </div>
          )}
        </div>
      </div>
    );
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
                onClick={() => void handleSelectFile(file)}
                className={`flex items-start justify-between gap-2 rounded-lg border p-3 cursor-pointer transition-colors
                  ${
                    file.isDeleted
                      ? "border-red-400 bg-red-50 opacity-70"
                      : selectedFile?.id === file.id
                        ? "bg-violet-50 border-violet-200"
                        : "hover:bg-slate-50"
                  }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {file.file?.name ?? file.description ?? 'Attachment'}
                  </p>

                  {file.isDeleted && (
                    <p className="text-xs text-red-600 font-medium">
                      Will be deleted when you save
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {file.file ? `${Math.round(file.file.size / 1024)} KB` : ''}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {file.file?.type || file.mimeType || file.url || "Unknown type"}
                  </p>
                  {file.uploadStatus && (
                    <div className={`flex items-center gap-1 text-xs ${getStatusColor(file.uploadStatus)}`}>
                      {getStatusIcon(file.uploadStatus)}
                      <span className="capitalize">{file.uploadStatus}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {downloadFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        void downloadFile(file);
                      }}
                    >
                      <Download className="h-3 w-3" />
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
      <div className="rounded-2xl border bg-white flex items-center justify-center min-h-[420px] overflow-hidden">
        {files.length === 0 ? (
          <div className="text-center text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              Select an attachment on the left to preview contents here.
            </p>
          </div>
        ) : selectedFile ? (
          canPreview(selectedFile) ? (
            <div className="w-full h-full">
              {isExcelFile(selectedFile) ? (
                renderExcelPreview()
              ) : previewType.startsWith("image/") ? (
                <div className="p-6">
                  <img 
                    src={previewUrl} 
                    alt={selectedFile.file?.name ?? selectedFile.description}
                    className="w-full h-[400px] object-contain rounded-xl border"
                  />
                </div>
              ) : previewType.startsWith('video/') ? (
                <div className="p-6">
                  <video 
                    controls 
                    className="w-full h-[400px] rounded-xl border"
                    src={previewUrl}
                  />
                </div>
              ) : previewType.startsWith('audio/') ? (
                <div className="flex flex-col items-center justify-center h-[400px] p-6">
                  <FileText className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-lg font-medium">{selectedFile.file?.name ?? selectedFile.description}</p>
                  <audio controls className="mt-4 w-full max-w-md" src={previewUrl} />
                </div>
              ) : (
                <div className="p-6">
                  <iframe
                    src={previewUrl}
                    className="w-full h-[400px] rounded-xl border"
                    title={selectedFile.file?.name ?? selectedFile.description}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                Preview not available for this file type
              </p>
              <p className="text-xs mt-1">{selectedFile.file?.name ?? selectedFile.description}</p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}