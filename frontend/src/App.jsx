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
      alert("Enter a URL");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✨ HTML → PDF</h1>

        <input
          type="text"
          placeholder="Enter website URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="PDF file name (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={styles.input}
        />

        <div style={styles.toggleBox}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={mobileView}
              onChange={() => setMobileView(!mobileView)}
            />
            📱 Mobile
          </label>

          <label style={styles.label}>
            <input
              type="checkbox"
              checked={imageMode}
              onChange={() => setImageMode(!imageMode)}
            />
            🖼️ HD Mode
          </label>
        </div>

        <button onClick={handleConvert} style={styles.button}>
          Convert to PDF
        </button>

        {loading && (
          <div style={styles.loaderWrapper}>
            <div style={styles.spinner}></div>
            <p>Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

/* 🎨 STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a, #020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif"
  },

  card: {
    backdropFilter: "blur(20px)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    textAlign: "center",
    color: "#fff"
  },

  title: {
    marginBottom: "20px",
    fontWeight: "600"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff"
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
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #9333ea)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  },

  loaderWrapper: {
    marginTop: "20px"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.2)",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
  }
};