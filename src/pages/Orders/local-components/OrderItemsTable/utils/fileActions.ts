export const downloadFile = (url: string, fileName?: string) => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to download file:', error);
    // Fallback: open in new window
    window.open(url, '_blank');
  }
};

export const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
