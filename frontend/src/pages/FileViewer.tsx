import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface FileViewerProps {
  filename: string;
  /** Extracted text content (fallback when fileUrl is not available) */
  content: string | null;
  /** URL to the original file on the backend (/api/notes/{id}/file) */
  fileUrl: string | null;
}

// Extensions renderable via <iframe> natively in browser
const IFRAME_EXTENSIONS = new Set(['pdf', 'html', 'htm', 'txt', 'md', 'markdown', 'svg']);

// Image extensions renderable via <img>
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);

// Extensions we can show as text fallback (pre or ReactMarkdown)
// (kept for potential future use)

// Extensions that cannot be previewed at all — download only
const DOWNLOAD_ONLY_EXTENSIONS = new Set([
  'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
  'zip', 'rar', '7z', 'tar', 'gz', 'exe', 'dmg', 'pkg', 'deb',
]);

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function getFileIcon(ext: string): string {
  if (ext === 'pdf') return '📄';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return '📊';
  if (['doc', 'docx', 'odt'].includes(ext)) return '📝';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return '📽️';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return '🖼️';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return '🎵';
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return '🎬';
  if (['json', 'xml', 'yaml', 'yml', 'toml'].includes(ext)) return '⚙️';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'go', 'rs'].includes(ext)) return '💻';
  if (ext === 'md' || ext === 'markdown') return '📋';
  if (['html', 'htm'].includes(ext)) return '🌐';
  return '📄';
}

function downloadTextAsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FileViewer({ filename, content, fileUrl }: FileViewerProps) {
  const ext = useMemo(() => getExtension(filename), [filename]);
  const icon = useMemo(() => getFileIcon(ext), [ext]);

  const isImage = IMAGE_EXTENSIONS.has(ext);
  const isIframe = IFRAME_EXTENSIONS.has(ext);
  const isMarkdownFallback = ext === 'md' || ext === 'markdown';
  const isDownloadOnly = DOWNLOAD_ONLY_EXTENSIONS.has(ext);

  // Whether the file actually exists on the server (probe on mount)
  const [fileAvailable, setFileAvailable] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!fileUrl) { setFileAvailable(false); return; }
    // HEAD request to check if the file exists on the server
    fetch(fileUrl, { method: 'HEAD' })
      .then(r => {
        const ok = r.ok;
        setFileAvailable(ok);
        // Auto-open if the file is available and it's a renderable type
        if (ok && (isIframe || isImage)) setOpen(true);
      })
      .catch(() => setFileAvailable(false));
  }, [fileUrl, isIframe, isImage]);

  const canPreview =
    (fileAvailable && (isIframe || isImage)) ||
    // Show text fallback for ANY extension when content is available and file not on disk
    (!fileAvailable && content !== null && content.trim().length > 0);

  const showTextFallback = !fileAvailable && content;

  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <span className="file-viewer-icon">{icon}</span>
        <span className="file-viewer-name">{filename}</span>

        <div className="file-viewer-actions">
          {canPreview && (
            <button
              className="file-viewer-toggle"
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
            >
              {open ? '▲ Ocultar' : '▼ Ver documento'}
            </button>
          )}

          {/* Download: real file if available, otherwise extracted text */}
          {fileAvailable && fileUrl ? (
            <a
              className="file-viewer-download"
              href={`${fileUrl}?dl=1`}
              download={filename}
              title="Descargar archivo original"
            >
              ⬇ Descargar
            </a>
          ) : content ? (
            <button
              className="file-viewer-download"
              type="button"
              onClick={() => {
                // Save as .txt so the OS can open it — the file doesn't exist on disk
                const txtName = filename.replace(/\.[^.]+$/, '') + '.txt';
                downloadTextAsFile(txtName, content);
              }}
              title="Descargar contenido extraído como .txt"
            >
              ⬇ Descargar texto
            </button>
          ) : null}

          {isDownloadOnly && !fileAvailable && !content && (
            <span className="file-viewer-no-preview">
              Vista previa no disponible para este tipo de archivo
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="file-viewer-body">
          {/* Real file from backend */}
          {fileAvailable && isImage && fileUrl && (
            <img src={fileUrl} alt={filename} className="file-viewer-img" />
          )}
          {fileAvailable && isIframe && fileUrl && (
            <iframe
              src={fileUrl}
              title={filename}
              className="file-viewer-iframe"
            />
          )}

          {/* Fallback: extracted text (shown when no file on disk) */}
          {showTextFallback && (
            isMarkdownFallback
              ? <div className="file-viewer-markdown"><ReactMarkdown>{content!}</ReactMarkdown></div>
              : (
                <div>
                  {ext === 'pdf' && (
                    <p className="file-viewer-fallback-note">
                      ⚠️ El archivo original no está disponible en el servidor. Mostrando el texto extraído del PDF.
                    </p>
                  )}
                  <pre className="file-viewer-pre">{content}</pre>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
