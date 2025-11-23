import "./Admin.css";
import { useEffect, useState, useCallback } from "react";

function Admin() {
  const BACKEND_URL = "https://sm-driving-backend.onrender.com";

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

  // Slider Images
  const [sliderImages, setSliderImages] = useState([]);
  const [sliderFile, setSliderFile] = useState(null);

  const [activeSection, setActiveSection] = useState(null);

  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginUsername || !loginPassword) return alert("Enter username & password");

    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful");
        setIsLoggedIn(true);
        localStorage.setItem("adminLoggedIn", "true");
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      alert("Login error");
      console.log(err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    setActiveSection(null);
  };

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // --------------------------
  // FETCH INQUIRIES
  // --------------------------
  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/inquiries`);
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      console.log("Inquiry fetch error:", err);
    }
  }, []);

  const deleteInquiry = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/inquiry/${id}`, { method: "DELETE" });
      fetchInquiries();
    } catch (err) {
      console.log(err);
    }
  };

  // --------------------------
  // FETCH SERVICES
  // --------------------------
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.log("Service fetch error:", err);
    }
  }, []);

  const addService = async () => {
    if (!serviceName || !documents || !price || !duration || !description) {
      return alert("Fill all fields");
    }

    try {
      let finalImageURL = imageURL;

      // Upload if file selected
      if (serviceImageFile) {
        const formData = new FormData();
        formData.append("file", serviceImageFile);

        const upload = await fetch(`${BACKEND_URL}/upload-service-image`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await upload.json();
        finalImageURL = uploadData.image_url;
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
          imageURL: finalImageURL,
        }),
      });

      if (res.ok) {
        alert("Service added");
        fetchServices();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteService = async (id) => {
    await fetch(`${BACKEND_URL}/service/${id}`, { method: "DELETE" });
    fetchServices();
  };

  // --------------------------
  // SLIDER IMAGES
  // --------------------------
  const fetchSliderImages = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/slider-images`);
      const data = await res.json();
      setSliderImages(data.images || []);
    } catch (err) {
      console.log("Slider fetch error:", err);
    }
  }, []);

  const uploadSliderImage = async () => {
    if (!sliderFile) return alert("Select an image");
    if (sliderImages.length >= 5) return alert("Max 5 allowed");

    const formData = new FormData();
    formData.append("file", sliderFile);

    await fetch(`${BACKEND_URL}/slider-images/upload`, {
      method: "POST",
      body: formData,
    });

    fetchSliderImages();
  };

  const deleteSliderImage = async (id) => {
    await fetch(`${BACKEND_URL}/slider-images/${id}`, { method: "DELETE" });

    fetchSliderImages();
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeSection === "inquiries") fetchInquiries();
    if (activeSection === "services") fetchServices();
    if (activeSection === "slider") fetchSliderImages();
  }, [isLoggedIn, activeSection]);

  // --------------------------
  // LOGIN PAGE
  // --------------------------
  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <h1>Admin Login</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <p>Use <b>sm</b> / <b>sm123</b></p>
      </div>
    );
  }

  // --------------------------
  // MAIN ADMIN UI
  // --------------------------
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* MENU */}
      {!activeSection && (
        <div className="admin-menu">
          <button onClick={() => setActiveSection("inquiries")}>📋 Inquiries</button>
          <button onClick={() => setActiveSection("services")}>🛠 Services</button>
          <button onClick={() => setActiveSection("slider")}>🖼 Slider Images</button>
        </div>
      )}

      {/* SLIDER SECTION */}
      {activeSection === "slider" && (
        <div>
          <h2>Slider Images</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <div>
            <input type="file" accept="image/*" onChange={(e) => setSliderFile(e.target.files[0])} />
            <button onClick={uploadSliderImage}>Upload</button>
          </div>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px" }}>
            {sliderImages.map((img) => (
              <div key={img._id} style={{ position: "relative" }}>
                <img src={img.url} width="160" height="120" style={{ borderRadius: "8px", objectFit: "cover" }} />
                <button
                  onClick={() => deleteSliderImage(img._id)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    border: "none",
                    height: "26px",
                    width: "26px",
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

      {/* INQUIRIES SECTION */}
      {activeSection === "inquiries" && (
        <div>
          <h2>Manage Inquiries</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Mobile</th><th>Message</th><th>Date</th><th>Action</th>
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
                  <td><button onClick={() => deleteInquiry(inq._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SERVICES SECTION */}
      {activeSection === "services" && (
        <div>
          <h2>Manage Services</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <input type="text" placeholder="Service Name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          <input type="text" placeholder="Documents" value={documents} onChange={(e) => setDocuments(e.target.value)} />
          <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input type="text" placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e) => setServiceImageFile(e.target.files[0])} />

          <button onClick={addService}>Add Service</button>

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th><th>Docs</th><th>Price</th><th>Duration</th><th>Description</th><th>Image</th><th>Action</th>
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
                  <td><img src={s.imageURL} width="60" /></td>
                  <td><button onClick={() => deleteService(s._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default Admin;
