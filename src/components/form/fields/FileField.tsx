import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function FileField({
  value,
  onChange,
  error,
  onErrorClear,
  settings
}: any) {
  const maxFiles = settings?.max_files || 1;
  const maxSize = settings?.max_file_size || 5 * 1024 * 1024; // Default 5MB
  const allowMultiple = settings?.multiple_files || false;
  const allowedExtensions =
    settings?.allowed_extensions?.split(",").map((ext: string) => ext.trim()) ||
    [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...value];
      acceptedFiles.forEach((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (
          allowedExtensions.length > 0 &&
          extension &&
          !allowedExtensions.includes(extension)
        ) {
          console.error(`File type .${extension} not allowed`);
          return;
        }
        if (file.size > maxSize) {
          console.error("File too large");
          return;
        }
        newFiles.push(file);
      });
      const finalFiles = newFiles.slice(0, maxFiles);
      onChange(finalFiles);
      if (error && onErrorClear) {
        onErrorClear();
      }
    },
    [value, maxFiles, maxSize, allowedExtensions, error, onErrorClear]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: allowMultiple,
    maxFiles: maxFiles,
    maxSize: maxSize,
    accept:
      allowedExtensions.length > 0
        ? allowedExtensions.reduce(
            (acc: Record<string, string[]>, ext: string) => {
              const mimeType = getMimeType(ext);
              if (mimeType) {
                if (!acc[mimeType]) {
                  acc[mimeType] = [];
                }
                acc[mimeType].push(`.${ext}`);
              }
              return acc;
            },
            {}
          )
        : undefined
  });

  const removeFile = (index: number) => {
    const newFiles = value.filter((_: unknown, i: number) => i !== index);
    onChange(newFiles);
  };

  const getFileIcon = (fileName: string | undefined) => {
    if (!fileName) {
      return (
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) {
      return (
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    }
    if (["mp4", "webm", "ogg", "mov", "avi"].includes(extension || "")) {
      return (
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-6 h-6 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`transition border-2 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500 ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }`}
      >
        <input {...getInputProps()} />
        <div className="p-6 text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {isDragActive
              ? "Drop files here..."
              : `Drag & drop files here, or click to select files`}
          </p>
          {allowedExtensions.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Allowed types:{" "}
              {allowedExtensions.map((ext: string) => `.${ext}`).join(", ")}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max size: {formatBytes(maxSize)}
          </p>
          {allowMultiple && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max files: {maxFiles}
            </p>
          )}
        </div>
      </div>
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file: File, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name)}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-error-500 dark:hover:text-error-400"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getMimeType(extension: string): string | null {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    csv: "text/csv",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo"
  };
  return mimeTypes[extension.toLowerCase()] || null;
}
