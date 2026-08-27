export const getMimeType = (url: string = "") => {
    const cleanUrl = url.split("?")[0];
    const filename = cleanUrl.split("/").pop() || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
        // Images
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "webp":
        case "svg":
        case "ico":
            return ext === "svg"
                ? "image/svg+xml"
                : ext === "ico"
                    ? "image/x-icon"
                    : "image/*";

        // PDF
        case "pdf":
            return "application/pdf";

        // Word
        case "doc":
            return "application/msword";

        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        // Excel
        case "xls":
            return "application/vnd.ms-excel";

        case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        // CSV
        case "csv":
            return "text/csv";

        // PowerPoint
        case "ppt":
            return "application/vnd.ms-powerpoint";

        case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";

        // Text
        case "txt":
            return "text/plain";

        // Video
        case "mp4":
            return "video/mp4";

        case "webm":
            return "video/webm";

        case "mov":
            return "video/quicktime";

        case "avi":
            return "video/x-msvideo";

        // Audio
        case "mp3":
            return "audio/mpeg";

        case "wav":
            return "audio/wav";

        case "ogg":
            return "audio/ogg";

        // Archives
        case "zip":
            return "application/zip";

        case "rar":
            return "application/vnd.rar";

        case "7z":
            return "application/x-7z-compressed";

        default:
            return "application/octet-stream";
    }
};