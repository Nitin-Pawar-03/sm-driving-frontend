import React, { useState, useEffect } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_BASE_URL || "https://sm-driving-backend.onrender.com";

function AdminSlider() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all slider images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/slider-images`);
      if (!res.ok) {
        console.error("Failed to fetch slider images", res.status);
        setImages([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch (err) {
      console.error("Error fetching images:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload an image
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an image first!");
    if (images.length >= 5) return alert("Maximum 5 slider images allowed!");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/slider-images/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Image uploaded successfully!");
        setSelectedFile(null);
        fetchImages();
      } else {
        alert("Image upload failed!");
        console.error(await res.text());
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  // Delete an image
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this image?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/slider-images/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Image deleted!");
        fetchImages();
      } else {
        alert("Delete failed!");
        console.error(await res.text());
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>🖼️ Manage Slider Images</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        style={{ marginRight: "10px" }}
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ padding: "6px 15px", cursor: "pointer" }}
      >
        {loading ? "Working..." : "Upload"}
      </button>

      <p style={{ color: "#888", marginTop: "10px" }}>
        (Maximum 5 images allowed)
      </p>

      {/* Gallery */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {Array.isArray(images) && images.length > 0 ? (
          images.map((img) => (
            <div key={img._id} style={{ position: "relative" }}>
              <img
                src={img.url}
                alt="slider"
                width="200"
                height="120"
                style={{
                  borderRadius: "8px",
                  border: "2px solid #ccc",
                  objectFit: "cover",
                }}
              />

              <button
                onClick={() => handleDelete(img._id)}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "25px",
                  height: "25px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div style={{ color: "#888" }}>
            {loading ? "Loading images..." : "No images uploaded yet"}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSlider;
