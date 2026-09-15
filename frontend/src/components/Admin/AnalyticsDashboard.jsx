import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminAPI';

export default function AnalyticsDashboard({ refreshTrigger }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!analytics) {
    return <div>No data</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>Analytics & Insights</h2>

      {/* LISTINGS BY CATEGORY */}
      <div className="analytics-card">
        <h3>📊 Listings by Category</h3>
        <div className="chart-data">
          {analytics.listingsByCategory.length === 0 ? (
            <p className="no-data">No data</p>
          ) : (
            analytics.listingsByCategory.map((item, idx) => (
              <div key={idx} className="data-row">
                <span className="data-label">{item.category}</span>
                <div className="data-bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.count / Math.max(...analytics.listingsByCategory.map(x => x.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="data-value">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LISTINGS BY STATUS */}
      <div className="analytics-card">
        <h3>📈 Listings by Status</h3>
        <div className="chart-data">
          {analytics.listingsByStatus.length === 0 ? (
            <p className="no-data">No data</p>
          ) : (
            analytics.listingsByStatus.map((item, idx) => (
              <div key={idx} className="data-row">
                <span className="data-label">{item.status}</span>
                <div className="data-bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.count / Math.max(...analytics.listingsByStatus.map(x => x.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="data-value">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MOST REPORTED LISTINGS */}
      <div className="analytics-card">
        <h3>🚨 Most Reported Listings</h3>
        <div className="data-list">
          {analytics.mostReportedListings.length === 0 ? (
            <p className="no-data">No reports</p>
          ) : (
            analytics.mostReportedListings.map((item, idx) => (
              <div key={idx} className="data-item">
                <div className="item-rank">#{idx + 1}</div>
                <div className="item-content">
                  <p className="item-title">{item.title}</p>
                  <p className="item-seller">By: {item.sellerName}</p>
                </div>
                <div className="item-stat">
                  <span className="stat-badge">{item.reportsCount} reports</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TOP SELLERS */}
      <div className="analytics-card">
        <h3>⭐ Top Sellers</h3>
        <div className="data-list">
          {analytics.topSellers.length === 0 ? (
            <p className="no-data">No sellers</p>
          ) : (
            analytics.topSellers.map((item, idx) => (
              <div key={idx} className="data-item">
                <div className="item-rank">#{idx + 1}</div>
                <div className="item-content">
                  <p className="item-title">{item.name}</p>
                  <p className="item-seller">{item.email}</p>
                </div>
                <div className="item-stats">
                  <span className="item-stat">Listings: {item.listingsCount}</span>
                  <span className="item-stat">Sold: {item.soldCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}