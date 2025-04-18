import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const symbol = "SBIN"; // Change this to the stock symbol you want
  const uri = `https://cbabd13f6c54798a9ec05df5b8070a6e.r2.cloudflarestorage.com/desiquant/data/candles/${symbol}/EQ.parquet.gz`;
  const s3Params = {
    endpoint_url: "https://cbabd13f6c54798a9ec05df5b8070a6e.r2.cloudflarestorage.com",
    key: "5c8ea9c516abfc78987bc98c70d2868a",
    secret: "0cf64f9f0b64f6008cf5efe1529c6772daa7d7d0822f5db42a7c6a1e41b3cadf",
    client_kwargs: { region_name: "auto" },
  };

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(uri, {
          headers: {
            "Authorization": `AWS ${s3Params.key}:${s3Params.secret}`,
            "Content-Type": "application/octet-stream",
          },
        });

        console.log("API Response:", response.data);
        setStockData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError("Failed to fetch stock data.");
        setLoading(false);
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: stockData.map((entry) => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${symbol} Price`,
        data: stockData.map((entry) => entry.close),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Stock Market Dashboard ({symbol})</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <div style={{ width: "80%", margin: "0 auto" }}>
            <Line data={chartData} />
          </div>

          <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td>{entry.open}</td>
                  <td>{entry.high}</td>
                  <td>{entry.low}</td>
                  <td>{entry.close}</td>
                  <td>{entry.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;
