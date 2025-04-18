import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

function vapp() {
  const [symbol, setSymbol] = useState("");
  const [stockInfo, setStockInfo] = useState(null);

  const fetchStockData = async () => {
    if (!symbol) return alert("Please enter a stock symbol!");
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/stock/data/${symbol}`);
      setStockInfo(response.data);
    } catch (error) {
      alert("Error fetching stock data!");
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center">Stock Market Dashboard</h2>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter Stock Symbol (e.g., AAPL, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <button className="btn btn-primary" onClick={fetchStockData}>Search</button>
          </div>
        </div>
      </div>

      {/* Stock Info Display */}
      {stockInfo && (
        <div className="card">
          <div className="card-body">
            <h3>{stockInfo.company_info.name}</h3>
            <h4>${stockInfo.real_time.price.toFixed(2)}</h4>
            <span className={stockInfo.real_time.change >= 0 ? "text-success" : "text-danger"}>
              {stockInfo.real_time.change >= 0 ? "+" : ""}
              {stockInfo.real_time.change.toFixed(2)} ({stockInfo.real_time.change_percent.toFixed(2)}%)
            </span>

            <p>Market Cap: ${stockInfo.financials.market_cap}</p>
            <p>52-Week High: ${stockInfo.financials.high_52_week}</p>
            <p>52-Week Low: ${stockInfo.financials.low_52_week}</p>
          </div>
        </div>
      )}

      {/* Stock Price Chart */}
      {stockInfo && stockInfo.chart_data && (
        <div className="mt-4">
          <Plot
            data={[
              {
                x: stockInfo.chart_data.dates,
                y: stockInfo.chart_data.prices,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{ title: `Stock Price Chart (${symbol.toUpperCase()})` }}
          />
        </div>
      )}
    </div>
  );
}

export default vapp;
