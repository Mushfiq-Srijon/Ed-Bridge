import React from 'react';

/**
 * Shared loading state for admin modules.
 * The animated orbit gives the dashboard a clear system-status moment without
 * making the whole page feel like a blocking browser loader.
 */
export default function AdminLoading({ label = 'Loading module' }) {
  return (
    <div className="admin-loading-state" role="status" aria-live="polite">
      <div className="admin-loader-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="admin-loading-copy">
        <span className="admin-loading-eyebrow">SYSTEM SYNC</span>
        <strong>{label}</strong>
        <span>Fetching the latest signal...</span>
      </div>
    </div>
  );
}
