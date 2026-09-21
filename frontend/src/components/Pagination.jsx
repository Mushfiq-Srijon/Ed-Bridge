import React from 'react';
import '../styles/Pagination.css';

/** Shared six-item pagination control for resource lists. */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="pagination-button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        ← Previous
      </button>
      <div className="pagination-pages">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className={`pagination-page ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      <button type="button" className="pagination-button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next →
      </button>
    </nav>
  );
}
