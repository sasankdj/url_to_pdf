const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const path = require("path");
const sizeOf = require("image-size");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/pdf/generate", async (req, res) => {
  const { url, fileName, imageMode } = req.body;

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    await page.waitForSelector("img").catch(() => {});

    // extract images
    const images = await page.evaluate(() => {
      const set = new Set();

      document.querySelectorAll("img").forEach(img => {
        if (img.src) set.add(img.src);
        if (img.dataset.src) set.add(img.dataset.src);
      });

      return Array.from(set);
    });

    if (!images.length) throw new Error("No images");

    const pdf = await createPDF(images);

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${fileName || "file"}.pdf`
    });

    res.send(pdf);

  } catch (err) {
    if (browser) await browser.close();
    res.status(500).send("Error");
  }
});

async function createPDF(images) {
  return new Promise(async (resolve) => {
    const doc = new PDFDocument({ autoFirstPage: false });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    for (let img of images) {
      try {
        let buffer;

        if (img.startsWith("data:image")) {
          buffer = Buffer.from(img.split(",")[1], "base64");
        } else {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          buffer = res.data;
        }

        const { width, height } = sizeOf(buffer);

        doc.addPage({ size: [width, height], margin: 0 });
        doc.image(buffer, 0, 0, { width, height });

      } catch {}
    }

    doc.end();
  });
}

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));