import React, { useState, useEffect } from 'react';
import './StockViews.css';

const StockViews = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:5001/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError('Unable to load news. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(); // Initial fetch
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Color palette for flashcard backgrounds
  const colors = [
    'coral',
    'teal',
    'mustard',
    'lavender',
    'mint',
    'peach',
    'sky',
    'rose',
  ];

  return (
    <div className={`stock-views ${theme}`}>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>

      <div className="header">
        <h2>Trending Stock Market News</h2>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading news...</p>
        </div>
      )}

      <div className="news-grid">
        {news.length === 0 && !loading && !error && (
          <p className="no-news">No news available at the moment.</p>
        )}
        {news.map((item, index) => (
          <div
            key={index}
            className={`news-card ${colors[index % colors.length]}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <div className="news-footer">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockViews;