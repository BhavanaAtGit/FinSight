import React, { useState } from 'react';
import axios from 'axios';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import theme from './theme'; // Assuming same MUI theme as FindStock
import './StockDashboard.css';

function StockDashboard() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchData = async () => {
    setLoading(true);
    setError('');
    setStockData(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/stock/data/${symbol.toUpperCase()}`);
      setStockData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const renderChart = (chartData) => {
    if (!chartData?.dates || !chartData?.prices) return null;
    const data = chartData.dates.map((date, index) => ({
      date,
      price: chartData.prices[index],
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
          <XAxis dataKey="date" stroke="#ffffff" tick={{ fontSize: 12 }} />
          <YAxis stroke="#ffffff" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#030711', border: '1px solid #14b8a6', color: '#ffffff' }}
            formatter={(value) => `${value.toFixed(2)}`}
          />
          <Line type="monotone" dataKey="price" stroke="#14b8a6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="stock-dashboard-container">
        {/* Background Elements */}
        <div className="background-overlay">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>

        <Container maxWidth="lg" className="content-wrapper">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom align="center" className="main-title">
              Stock Dashboard
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Paper elevation={3} className="input-paper">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  className="search-input"
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleFetchData}
                  disabled={loading}
                  className="fetch-button"
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Fetch Data'}
                </Button>
              </Box>

              {error && (
                <Fade in={!!error}>
                  <Typography color="error" className="error-message">
                    {error}
                  </Typography>
                </Fade>
              )}

              {stockData && (
                <Fade in={!!stockData}>
                  <Box className="result-container">
                    {/* Real-Time Data */}
                    <Card className="data-card">
                      <CardContent>
                        <Typography variant="h4" className="section-title">
                          {stockData.company_info.name} ({symbol.toUpperCase()})
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Price:</strong> ${formatNumber(stockData.real_time.price)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Change:</strong> {formatNumber(stockData.real_time.change)} (
                              {formatNumber(stockData.real_time.change_percent)}%)
                            </Typography>
                            <Typography className="section-text">
                              <strong>Volume:</strong> {formatNumber(stockData.real_time.volume)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Latest Trading Day:</strong> {stockData.real_time.latest_trading_day}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Price Chart */}
                    <Card className="data-card">
                      <CardContent>
                        <Typography variant="h4" className="section-title">
                          Price Trend (Last 30 Days)
                        </Typography>
                        {renderChart(stockData.chart_data)}
                      </CardContent>
                    </Card>

                    {/* Company Info */}
                    <Card className="data-card">
                      <CardContent>
                        <Typography variant="h4" className="section-title">
                          Company Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Sector:</strong> {stockData.company_info.sector}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Market Cap:</strong> ${formatNumber(stockData.company_info.market_cap)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>P/E Ratio:</strong> {formatNumber(stockData.company_info.pe_ratio)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Dividend Yield:</strong> {formatNumber(stockData.company_info.dividend_yield)}%
                            </Typography>
                            <Typography className="section-text">
                              <strong>Beta:</strong> {formatNumber(stockData.company_info.beta)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card className="data-card">
                      <CardContent>
                        <Typography variant="h4" className="section-title">
                          Financials
                        </Typography>
                        <Typography variant="h6" className="sub-section-title">
                          Income Statement
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Total Revenue:</strong> ${formatNumber(stockData.financials.income_statement.totalRevenue)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Gross Profit:</strong> ${formatNumber(stockData.financials.income_statement.grossProfit)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Operating Income:</strong> ${formatNumber(stockData.financials.income_statement.operatingIncome)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Net Income:</strong> ${formatNumber(stockData.financials.income_statement.netIncome)}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Typography variant="h6" className="sub-section-title" sx={{ mt: 2 }}>
                          Balance Sheet
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Total Assets:</strong> ${formatNumber(stockData.financials.balance_sheet.totalAssets)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Total Liabilities:</strong> ${formatNumber(stockData.financials.balance_sheet.totalLiabilities)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography className="section-text">
                              <strong>Shareholder Equity:</strong> ${formatNumber(stockData.financials.balance_sheet.totalShareholderEquity)}
                            </Typography>
                            <Typography className="section-text">
                              <strong>Cash & Equivalents:</strong> ${formatNumber(stockData.financials.balance_sheet.cashAndCashEquivalents)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                </Fade>
              )}
            </Paper>
          </motion.div>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default StockDashboard;