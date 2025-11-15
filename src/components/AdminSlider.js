import React, { useState, useEffect } from "react";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";

function AdminSlider() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);

  // Fetch existing images
  const fetchImages = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/images`);
      const data = await res.json();
      setImages(data.images);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload image
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an image first!");
    if (images.length >= 5) return alert("Maximum 5 images allowed for the slider.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${BACKEND_URL}/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Image uploaded successfully!");
        setSelectedFile(null);
        fetchImages();
      } else {
        alert("Image upload failed!");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  // Delete image
  const handleDelete = async (url) => {
    const filename = url.split("/").pop();
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/delete-image/${filename}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Image deleted successfully!");
        fetchImages();
      } else {
        alert("Failed to delete image.");
      }
    } catch (err) {
      console.error("Error deleting image:", err);
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
      <button onClick={handleUpload} style={{ padding: "5px 15px", cursor: "pointer" }}>
        Upload
      </button>

      <p style={{ color: "#888", marginTop: "10px" }}>
        (Maximum 5 images allowed in slider)
      </p>

      {/* Image Gallery */}
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {images.map((url, index) => (
          <div key={index} style={{ position: "relative" }}>
            <img
              src={url}
              alt={`slide-${index}`}
              width="200"
              height="120"
              style={{
                borderRadius: "8px",
                border: "2px solid #ccc",
                objectFit: "cover",
              }}
            />
            <button
              onClick={() => handleDelete(url)}
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
        ))}
      </div>
    </div>
  );
}

export default AdminSlider;
