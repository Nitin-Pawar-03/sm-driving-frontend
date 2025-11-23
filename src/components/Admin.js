import "./Admin.css";
import { useEffect, useState, useCallback } from "react";

function Admin() {
  const BACKEND_URL = "https://sm-driving-backend.onrender.com";

  // ========== STATE ==========
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [activeSection, setActiveSection] = useState(null);

  // Inquiry State
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const inquiriesPerPage = 5;

  // Services State
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [documents, setDocuments] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [serviceImageFile, setServiceImageFile] = useState(null);

  // Slider State
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderFile, setSliderFile] = useState(null);

  // ========== LOGIN ==========
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginUsername || !loginPassword)
      return alert("Enter username & password");

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
      } else {
        alert(data.detail || "Invalid login");
      }
    } catch (error) {
      alert("Error logging in");
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

  // ========== FETCH INQUIRIES ==========
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (err) {}
  }, []);

  const deleteInquiry = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/inquiry/${id}`, { method: "DELETE" });
      fetchInquiries();
    } catch {}
  };

  // ========== FETCH SERVICES ==========
  const fetchServices = useCallback(async () => {
    const res = await fetch(`${BACKEND_URL}/services`);
    setServices(await res.json());
  }, []);

  const addService = async () => {
    if (!serviceName || !documents || !price || !duration || !description)
      return alert("Fill all fields");

    let finalUrl = imageURL;

    if (serviceImageFile) {
      const formData = new FormData();
      formData.append("file", serviceImageFile);

      const uploadRes = await fetch(`${BACKEND_URL}/upload-service-image`, {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      finalUrl = data.image_url;
    }

    await fetch(`${BACKEND_URL}/service`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName,
        documents,
        price,
        duration,
        description,
        imageURL: finalUrl,
      }),
    });

    fetchServices();

    setServiceName("");
    setDocuments("");
    setPrice("");
    setDuration("");
    setDescription("");
    setImageURL("");
    setServiceImageFile(null);
  };

  const deleteService = async (id) => {
    await fetch(`${BACKEND_URL}/service/${id}`, { method: "DELETE" });
    fetchServices();
  };

  // ========== SLIDER IMAGES (CLOUDINARY) ==========
  const fetchSliderImages = useCallback(async () => {
    const res = await fetch(`${BACKEND_URL}/slider-images`);
    const data = await res.json();

    setSliderImages(Array.isArray(data.images) ? data.images : []);
  }, []);

  const uploadSliderImage = async () => {
    if (!sliderFile) return alert("Select an image");
    if (sliderImages.length >= 5)
      return alert("Maximum 5 slider images allowed");

    const formData = new FormData();
    formData.append("file", sliderFile);

    await fetch(`${BACKEND_URL}/slider-images/upload`, {
      method: "POST",
      body: formData,
    });

    setSliderFile(null);
    fetchSliderImages();
  };

  const deleteSliderImage = async (id) => {
    if (!window.confirm("Delete this image permanently?")) return;

    await fetch(`${BACKEND_URL}/slider-images/${id}`, { method: "DELETE" });
    fetchSliderImages();
  };

  // ========== LOAD DATA WHEN SECTION SELECTED ==========
  useEffect(() => {
    if (!isLoggedIn) return;

    if (activeSection === "inquiries") fetchInquiries();
    if (activeSection === "services") fetchServices();
    if (activeSection === "slider") fetchSliderImages();
  }, [activeSection, isLoggedIn]);

  // ------------- LOGIN UI -------------
  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin} className="login-form">
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
      </div>
    );
  }

  // ========== MAIN DASHBOARD ==========
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* MENU */}
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

      {/* ---------- INQUIRIES SECTION ---------- */}
      {activeSection === "inquiries" && (
        <div>
          <h2>Inquiries</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Message</th>
                <th>Date</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq._id}>
                  <td>{inq.name}</td>
                  <td>{inq.email}</td>
                  <td>{inq.mobile}</td>
                  <td>{inq.message}</td>
                  <td>{new Date(inq.date).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteInquiry(inq._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- SERVICES SECTION ---------- */}
      {activeSection === "services" && (
        <div>
          <h2>Manage Services</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <div className="service-form">
            <input
              type="text"
              placeholder="Service Name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Documents Required"
              value={documents}
              onChange={(e) => setDocuments(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="text"
              placeholder="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="text"
              placeholder="Image URL (optional)"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setServiceImageFile(e.target.files[0])}
            />

            <button onClick={addService}>Add Service</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Docs</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Image</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {services.map((s) => (
                <tr key={s._id}>
                  <td>{s.serviceName}</td>
                  <td>{s.documents}</td>
                  <td>{s.price}</td>
                  <td>{s.duration}</td>
                  <td>{s.description}</td>
                  <td>
                    {s.imageURL && (
                      <img src={s.imageURL} alt="" width="50" />
                    )}
                  </td>
                  <td>
                    <button onClick={() => deleteService(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- SLIDER SECTION ---------- */}
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

          <div className="slider-grid">
            {sliderImages.map((img) => (
              <div key={img._id} className="slider-item">
                <img src={img.url} width="180" height="120" />
                <button onClick={() => deleteSliderImage(img._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
