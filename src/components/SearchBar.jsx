import React, { useState } from 'react';
import { Search, Loader, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    fetch('http://127.0.0.1:5002/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setResult(`Error: ${data.error}`);
          setSources([]);
        } else {
          setResult(data.answer);
          setSources(data.sources.slice(0, 6));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setResult(`Error: ${error.message}`);
        setSources([]);
        setIsLoading(false);
      });
  };

  return (
    <div className="search-bar-container">
      {/* Background Elements */}
      <div className="background-overlay">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      <div className="search-content-wrapper">
        <h1 className="search-title">AI-Powered Financial Search</h1>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            placeholder="Ask about stocks, trends, or insights..."
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? (
              <Loader className="loading-spinner" />
            ) : (
              <>
                <Search className="search-icon" /> Search
              </>
            )}
          </button>
        </div>

        <div className="search-results-container">
          {result ? (
            <>
              <h2 className="results-title">Your Results</h2>
              <div className="result-text-container">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              {sources.length > 0 && (
                <>
                  <h3 className="sources-title">Top Sources</h3>
                  <div className="sources-list">
                    {sources.map((source, index) => (
                      <div key={index} className="source-item">
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          <span>{`Source ${index + 1}`}</span>
                          <ExternalLink className="external-link-icon" />
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="placeholder-message">
              Start searching to uncover financial insights!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}