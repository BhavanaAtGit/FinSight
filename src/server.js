const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS for all requests

const s3Url =
  "https://cbabd13f6c54798a9ec05df5b8070a6e.r2.cloudflarestorage.com/desiquant/data/candles/SBIN/EQ.parquet.gz";

app.get("/api/stock-data", async (req, res) => {
  try {
    const response = await axios.get(s3Url, {
      headers: {
        "x-api-key": "5c8ea9c516abfc78987bc98c70d2868a",
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
