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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import theme from './theme'; // Assuming this is your custom MUI theme
import "./FindStock.css";

function FindStock() {
  const [companyName, setCompanyName] = useState('Zomato');
  const [prompt1, setPrompt1] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://127.0.0.1:5000/analyze?company=${companyName}`);
      setPrompt1(response.data.prompt1);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setError('Failed to fetch financial analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (markdown) => {
    return (
      <ReactMarkdown
        components={{
          h4: ({ children }) => <Typography variant="h4" className="section-title">{children}</Typography>,
          ul: ({ children }) => <ul className="custom-list">{children}</ul>,
          li: ({ children }) => <li className="custom-list-item">{children}</li>,
          p: ({ children }) => <Typography className="section-text">{children}</Typography>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="find-stock-container">
        {/* Background Elements */}
        <div className="background-overlay">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>

        <Container maxWidth="md" className="content-wrapper">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom align="center" className="main-title">
              Financial Analysis Tool
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
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name (e.g., Zomato)"
                  className="search-input"
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="analyze-button"
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
                </Button>
              </Box>

              {error && (
                <Fade in={!!error}>
                  <Typography color="error" className="error-message">
                    {error}
                  </Typography>
                </Fade>
              )}

              {prompt1 && (
                <Fade in={!!prompt1}>
                  <Box className="result-container">
                    {/* Executive Summary */}
                    <Card className="analysis-card">
                      <CardContent>
                        {renderMarkdown(prompt1.split('#### **2. Financial Health Analysis**')[0])}
                      </CardContent>
                    </Card>

                    {/* Financial Health Analysis */}
                    <Card className="analysis-card">
                      <CardContent>
                        <Typography variant="h4" className="section-title">
                          2. Financial Health Analysis
                        </Typography>
                        <Typography className="section-text">
                          <strong>Profitability:</strong>
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Metric</TableCell>
                                <TableCell>Col 1</TableCell>
                                <TableCell>Col 4/5</TableCell>
                                <TableCell>Trend</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>P&L Mean Revenue</TableCell>
                                <TableCell>1285.57</TableCell>
                                <TableCell>832.06</TableCell>
                                <TableCell>Decrease</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Yearly Results</TableCell>
                                <TableCell>2108.47</TableCell>
                                <TableCell>776.76</TableCell>
                                <TableCell>Decrease</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Quarterly Results</TableCell>
                                <TableCell>535.96</TableCell>
                                <TableCell>381.81</TableCell>
                                <TableCell>Decrease</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Half Yearly Results</TableCell>
                                <TableCell>896.62</TableCell>
                                <TableCell>464.98</TableCell>
                                <TableCell>Decrease</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Nine Month Results</TableCell>
                                <TableCell>1364.39</TableCell>
                                <TableCell>1633.57</TableCell>
                                <TableCell>Increase</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography className="section-text" sx={{ mt: 2 }}>
                          <strong>Liquidity:</strong> Balance sheet shows a decrease from 4134.29 to 457.87.
                        </Typography>
                        <Typography className="section-text">
                          <strong>Solvency:</strong> Authorized Capital: ~1022.16 Cr, Issued Capital: ~617.19 Cr (std: 413.72 Cr).
                        </Typography>
                        <Typography className="section-text">
                          <strong>Growth:</strong> Mixed signals with asset growth but declining profitability.
                        </Typography>
                        <Box className="chart-placeholder">
                          <Typography>Placeholder: Revenue Trend Chart</Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Key Performance Indicators */}
                    <Card className="analysis-card">
                      <CardContent>
                        {renderMarkdown(prompt1.split('#### **4. Risk Factors**')[0].split('#### **2. Financial Health Analysis**')[1])}
                        <Box className="chart-placeholder">
                          <Typography>Placeholder: Cash Flow Volatility Chart</Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Risk Factors */}
                    <Card className="analysis-card">
                      <CardContent>
                        {renderMarkdown(prompt1.split('#### **5. Strategic Recommendations**')[0].split('#### **4. Risk Factors**')[1])}
                      </CardContent>
                    </Card>

                    {/* Strategic Recommendations */}
                    <Card className="analysis-card">
                      <CardContent>
                        {renderMarkdown(prompt1.split('#### **6. Future Outlook**')[0].split('#### **5. Strategic Recommendations**')[1])}
                      </CardContent>
                    </Card>

                    {/* Future Outlook */}
                    <Card className="analysis-card">
                      <CardContent>
                        {renderMarkdown(prompt1.split('#### **6. Future Outlook**')[1])}
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

export default FindStock;