import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VectorShiftLanding from './components/VectorShiftLanding';
import StockNewsPage from './pages/StockViews';
import SearchBar from './components/SearchBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import FindStock from './pages/FindStock';
import StockDashboard from './pages/StockDashboard';


function App() {

  const HtmlDashboard = () => {
    // Redirect to the Flask server URL (opens in the same tab)
    window.location.href = 'http://127.0.0.1:8000/';
    return null; // Return null since we're redirecting
  };

  return (
    <Router>
      <Navbar />  {/* Navbar appears on all pages */}
      <Routes>
        <Route path="/" element={<VectorShiftLanding />} />
        <Route path="/stock-news" element={<StockNewsPage />} />
        <Route path="/SearchBar" element={<SearchBar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/findstock" element={<FindStock />} />
        <Route path="/StockDashboard" element={<StockDashboard />} />
        <Route path="/html-dashboard" element={<HtmlDashboard />} />

      </Routes>
      <Footer />  {/* Footer appears on all pages */}
    </Router>
  );
}

export default App;
