import "./Admin.css";
import { useEffect, useState, useCallback } from "react";

function Admin() {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const inquiriesPerPage = 5;

  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [documents, setDocuments] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [serviceImageFile, setServiceImageFile] = useState(null);

  // Slider images state (NEW)
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderFile, setSliderFile] = useState(null);

  const [activeSection, setActiveSection] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const BACKEND_URL = "https://sm-driving-backend.onrender.com";

  // ========== LOGIN ============
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginUsername || !loginPassword) {
      return alert("Enter username & password");
    }

    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful");
        setIsLoggedIn(true);
        localStorage.setItem("adminLoggedIn", "true");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      alert("Error logging in");
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection(null);
    localStorage.removeItem("adminLoggedIn");
  };

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // ========== FETCH INQUIRIES ============
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    }
  }, []);

  const deleteInquiry = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/inquiry/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Inquiry deleted");
        fetchInquiries();
      }
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    }
  };

  // ========== FETCH SERVICES ============
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }, []);

  const addService = async () => {
    if (!serviceName || !documents || !price || !duration || !description) {
      return alert("Fill all fields");
    }

    try {
      let finalImgURL = imageURL;

      if (serviceImageFile) {
        const formData = new FormData();
        formData.append("file", serviceImageFile);

        const uploadRes = await fetch(`${BACKEND_URL}/upload-service-image`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        finalImgURL = uploadData.image_url || "";
      }

      const res = await fetch(`${BACKEND_URL}/service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName,
          documents,
          price,
          duration,
          description,
          imageURL: finalImgURL,
        }),
      });

      if (res.ok) {
        alert("Service added!");
        fetchServices();
        setServiceName("");
        setDocuments("");
        setPrice("");
        setDuration("");
        setDescription("");
        setImageURL("");
        setServiceImageFile(null);
      }
    } catch (err) {
      console.error("Error adding service:", err);
    }
  };

  const deleteService = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/service/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Service deleted!");
        fetchServices();
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // ========== SLIDER IMAGES (NEW SYSTEM) ============
  const fetchSliderImages = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/slider-images`);
      const data = await res.json();
      setSliderImages(Array.isArray(data.images) ? data.images : []);
    } catch (err) {
      console.error("Slider fetch error:", err);
    }
  }, []);

  const uploadSliderImage = async () => {
    if (!sliderFile) return alert("Select an image!");
    if (sliderImages.length >= 5) return alert("Maximum 5 images allowed!");

    const formData = new FormData();
    formData.append("file", sliderFile);

    try {
      const res = await fetch(`${BACKEND_URL}/slider-images/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Uploaded!");
        setSliderFile(null);
        fetchSliderImages();
      }
    } catch (err) {
      console.error("Slider upload error:", err);
    }
  };

  const deleteSliderImage = async (id) => {
    if (!window.confirm("Delete this image permanently?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/slider-images/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Image deleted!");
        fetchSliderImages();
      }
    } catch (err) {
      console.error("Delete slider error:", err);
    }
  };

  // Load section data
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeSection === "inquiries") fetchInquiries();
    if (activeSection === "services") fetchServices();
    if (activeSection === "slider") fetchSliderImages();
  }, [isLoggedIn, activeSection]);

  // LOGIN UI
  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <h1>Admin Login</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <p>Use <b>sm</b> / <b>sm123</b></p>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {!activeSection && (
        <div className="admin-menu">
          <button onClick={() => setActiveSection("inquiries")}>
            📋 Manage Inquiries
          </button>
          <button onClick={() => setActiveSection("services")}>
            🛠 Manage Services
          </button>
          <button onClick={() => setActiveSection("slider")}>
            🖼 Manage Slider Images
          </button>
        </div>
      )}

      {/* ----- SLIDER IMAGES (NEW) ----- */}
      {activeSection === "slider" && (
        <div>
          <h2>Manage Slider Images</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSliderFile(e.target.files[0])}
            />
            <button onClick={uploadSliderImage}>Upload</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "20px" }}>
            {sliderImages.map((img) => (
              <div key={img._id} style={{ position: "relative" }}>
                <img
                  src={img.url}
                  alt="slider"
                  width="180"
                  height="120"
                  style={{ borderRadius: "8px", objectFit: "cover" }}
                />
                <button
                  onClick={() => deleteSliderImage(img._id)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "red",
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
      )}

      {/* ------- OTHER SECTIONS (inquiries & services) ------- */}
      {/* Your existing inquiries/services code continues below unchanged */}
    </div>
  );
}

export default Admin;
