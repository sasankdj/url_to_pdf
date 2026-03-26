import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [mobileView, setMobileView] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/pdf/generate",
        { url, mobileView, fileName, imageMode },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName ? `${fileName}.pdf` : "website.pdf";
      link.click();

    } catch (err) {
      alert("Error generating PDF");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🌐 HTML → PDF Converter</h1>

        {/* URL Input */}
        <input
          type="text"
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />

        {/* File Name */}
        <input
          type="text"
          placeholder="Enter PDF name (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={styles.input}
        />

        {/* Toggles */}
        <div style={styles.toggleBox}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={mobileView}
              onChange={() => setMobileView(!mobileView)}
            />
            📱 Mobile View
          </label>

          <label style={styles.label}>
            <input
              type="checkbox"
              checked={imageMode}
              onChange={() => setImageMode(!imageMode)}
            />
            🖼️ HD Image Mode
          </label>
        </div>

        {/* Button */}
        <button onClick={handleConvert} style={styles.button}>
          Convert to PDF
        </button>

        {/* Loader */}
        {loading && (
          <div style={styles.loaderWrapper}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: "10px" }}>
              Generating high-quality PDF...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

/* 🎨 Styles */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  toggleBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px"
  },
  label: {
    fontSize: "14px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4facfe",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  loaderWrapper: {
    marginTop: "20px"
  },
  spinner: {
    width: "45px",
    height: "45px",
    border: "5px solid #ddd",
    borderTop: "5px solid #4facfe",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
  }
};