export const getPlainTextFromHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')  
    .replace(/&nbsp;/g, ' ')   
    .replace(/\s+/g, ' ')      
    .trim();
};