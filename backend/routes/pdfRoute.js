const express = require("express");
const puppeteer = require("puppeteer");
const axios = require("axios");
const PDFDocument = require("pdfkit");

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { url, mobileView, fileName, imageMode } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 🛡️ User agent
    await page.setUserAgent(
      mobileView
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    );

    // 📱 Viewport
    await page.setViewport(
      mobileView
        ? { width: 375, height: 812, isMobile: true }
        : { width: 1280, height: 800 }
    );

    // 🌐 Load page
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 0
    });

    // Wait for images
    await page.waitForSelector("img", { timeout: 10000 }).catch(() => {});

    // Scroll multiple times
    for (let i = 0; i < 5; i++) {
      await autoScroll(page);
      await delay(1000);
    }

    // Force lazy images
    await page.evaluate(() => {
      document.querySelectorAll("img").forEach(img => {
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.lazy) img.src = img.dataset.lazy;
      });
    });

    const safeFileName = fileName
      ? fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      : "website";

    // 🖼 IMAGE MODE (HD)
    if (imageMode) {
      const images = await extractImages(page);

      console.log("Images found:", images.length);

      if (!images.length) {
        throw new Error("No images found");
      }

      const pdfBuffer = await createImagePDF(images);

      await browser.close();

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${safeFileName}.pdf`
      });

      return res.send(pdfBuffer);
    }

    // 📄 NORMAL MODE
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${safeFileName}.pdf`
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Error:", error);

    if (browser) await browser.close();

    res.status(500).json({
      error: "Failed to generate PDF"
    });
  }
});


// 🔥 FIXED IMAGE EXTRACTION (BASE64 + ALL TYPES)
async function extractImages(page) {
  return await page.evaluate(() => {
    const imageSet = new Set();

    document.querySelectorAll("img").forEach(img => {
      if (img.src) imageSet.add(img.src);

      if (img.dataset.src) imageSet.add(img.dataset.src);
      if (img.dataset.lazy) imageSet.add(img.dataset.lazy);
    });

    document.querySelectorAll("img").forEach(img => {
      if (img.srcset) {
        const sources = img.srcset.split(",");
        sources.forEach(src => {
          const url = src.trim().split(" ")[0];
          if (url) imageSet.add(url);
        });
      }
    });

    return Array.from(imageSet).filter(src =>
      src.startsWith("http") || src.startsWith("data:image")
    );
  });
}


// 🔥 CREATE PDF (LANDSCAPE + BASE64 SUPPORT)
async function createImagePDF(imageUrls) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ autoFirstPage: false });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      for (let imgUrl of imageUrls) {
        try {
          let imgBuffer;

          // ✅ Base64 support
          if (imgUrl.startsWith("data:image")) {
            const base64Data = imgUrl.split(",")[1];
            imgBuffer = Buffer.from(base64Data, "base64");
          } else {
            const response = await axios.get(imgUrl, {
              responseType: "arraybuffer"
            });
            imgBuffer = response.data;
          }

          doc.addPage({
            size: "A4",
            layout: "landscape",
            margin: 0
          });

          doc.image(imgBuffer, 0, 0, {
            fit: [842, 595],
            align: "center",
            valign: "center"
          });

        } catch (err) {
          console.log("Skipping image:", imgUrl);
        }
      }

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}


// 📜 AUTO SCROLL
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}


// ⏳ DELAY
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = router;