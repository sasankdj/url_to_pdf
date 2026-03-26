const express = require("express");
const cors = require("cors");
const pdfRoute = require("./routes/pdfRoute");

const app = express();

// ✅ CORS
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// Routes
app.use("/api/pdf", pdfRoute);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 PDF Generator API running...");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});