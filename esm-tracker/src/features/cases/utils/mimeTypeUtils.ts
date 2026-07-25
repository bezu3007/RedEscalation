export const getMimeType = (url: string = "") => {
    const cleanUrl = url.split("?")[0];
    const filename = cleanUrl.split("/").pop() || "";
    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "webp":
            return "image/*";

        case "pdf":
            return "application/pdf";

        case "doc":
            return "application/msword";

        case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        case "mp4":
            return "video/mp4";

        case "mp3":
            return "audio/mpeg";

        default:
            return "application/octet-stream"; 
    }
};