import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chartImage from "../assets/chart.avif";
import "./VectorShift.css";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { BarChart, TrendingUp, ShowChart, Article } from "@mui/icons-material";

const VectorShiftLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="vs-container">
      <div className="background-overlay">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Empower Your Finances with
            <br />
            <span className="gradient-text animated-text">AI-Powered Insights</span>
          </h1>
          <p className="hero-subtitle">
            Unlock real-time stock data, market trends, and news with cutting-edge AI technology.
          </p>
          <div className="cta-group">
            <button className="primary-cta">Get Started</button>
            <button className="secondary-cta">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="gradient-border">
            <img src={chartImage} alt="Financial Analytics Dashboard" className="floating-image" />
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="cards-section">
        <DashboardCards />
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <Typography variant="h4" className="testimonial-title">What Our Users Say</Typography>
        <div className="testimonial-card">
          <Typography variant="body1">
            "FinSight transformed how I track my investments—real-time data and AI insights are a game-changer!"
          </Typography>
          <Typography variant="caption" className="testimonial-author">— Jane D., Investor</Typography>
        </div>
      </section>
    </div>
  );
};

const cardData = [
  { title: "Stock Insights", info: "Access real-time stock data and analytics.", link: "/findstock", icon: <BarChart fontSize="large" /> },
  { title: "AI-Powered Chatbot", info: "Answer all your stock market related queries.", link: "/SearchBar", icon: <TrendingUp fontSize="large" /> },
  { title: "Stock Report", info: "Fetches current or historical securities information.", link: "/html-dashboard", icon: <ShowChart fontSize="large" /> },
  { title: "News Hub", info: "Stay updated with the latest market news.", link: "/stock-news", icon: <Article fontSize="large" /> },
];

const DashboardCards = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={4} justifyContent="center">
      {cardData.map((card, index) => (
        <Grid item key={index} xs={12} sm={6} md={3}>
          <Card
            className={`dashboard-card card-${index}`}
            sx={{
              width: "100%",
              aspectRatio: "1/1",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() => navigate(card.link)}
          >
            <CardContent>
              <div className="card-icon">{card.icon}</div>
              <Typography variant="h6" className="card-title">
                {card.title}
              </Typography>
              <Typography variant="body2" className="card-info">
                {card.info}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default VectorShiftLanding;