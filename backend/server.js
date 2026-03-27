const express = require("express");
const cors = require("cors");
const pdfRoute = require("./routes/pdfRoute");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/pdf", pdfRoute);

app.get("/", (req, res) => {
  res.send("🚀 PDF Generator API running...");
});

// ✅ IMPORTANT (Render fix)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});