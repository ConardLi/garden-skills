import React, { useEffect, useState } from 'react';
import { listArchive } from '../../lib/archive-client';
import { ArchiveEntry } from '../../types/prompt';

interface ArchiveBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchiveBrowser: React.FC<ArchiveBrowserProps> = ({ isOpen, onClose }) => {
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchiveEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listArchive();
      if (response.entries) {
        setArchiveEntries(response.entries);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to load archive entries.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchiveEntries();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="archive-browser-overlay">
      <div className="archive-browser-sidebar">
        <div className="sidebar-header">
          <h2>提示詞歸檔</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="sidebar-content">
          {loading && <p>載入中...</p>}
          {error && <p className="error-message">錯誤: {error}</p>}
          {!loading && archiveEntries.length === 0 && <p>沒有歸檔的提示詞。</p>}
          {!loading && archiveEntries.length > 0 && (
            <ul>
              {archiveEntries.map(entry => (
                <li key={entry.slug} className="archive-entry-item">
                  <strong>{entry.template}</strong> (於 {new Date(entry.timestamp).toLocaleString()})
                  {/* Add more details or actions like "View" or "Copy" here */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
