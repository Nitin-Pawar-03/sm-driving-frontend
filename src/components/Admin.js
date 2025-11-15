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

  const [selectedFile, setSelectedFile] = useState(null); // slider image
  const [images, setImages] = useState([]);

  const [activeSection, setActiveSection] = useState(null); // "inquiries" | "services" | "slider" | null

  // ====== LOGIN STATE ======
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ====== SERVICE IMAGE FILE (separate from slider) ======
  const [serviceImageFile, setServiceImageFile] = useState(null);

  const BACKEND_URL = "https://sm-driving-backend.onrender.com";

  // ====== LOGIN HANDLERS ======
  const handleLogin = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!loginUsername || !loginPassword) {
      alert("Please enter username and password");
      return;
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
        // Better error message instead of [object Object]
        let msg = "Login failed";
        if (data.detail) {
          if (typeof data.detail === "string") {
            msg = data.detail;
          } else if (Array.isArray(data.detail)) {
            msg = data.detail
              .map((d) => d.msg || JSON.stringify(d))
              .join(", ");
          } else {
            msg = JSON.stringify(data.detail);
          }
        }
        alert(msg);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Error logging in");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection(null);
    localStorage.removeItem("adminLoggedIn");
  };

  // ====== LOAD LOGIN STATE FROM LOCALSTORAGE ======
  useEffect(() => {
    const loggedInFlag = localStorage.getItem("adminLoggedIn");
    if (loggedInFlag === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // ======= INQUIRIES ==========
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/inquiries`);
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  }, []);

  const deleteInquiry = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/inquiry/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Inquiry deleted successfully!");
        fetchInquiries();
      } else {
        const err = await response.json();
        alert(err.detail);
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  // ======= SERVICES ==========
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
      alert("Please fill all fields");
      return;
    }
    try {
      let imageUrlToSave = imageURL;

      // Upload service image to dedicated endpoint
      if (serviceImageFile) {
        const formData = new FormData();
        formData.append("file", serviceImageFile);

        const uploadRes = await fetch(
          `${BACKEND_URL}/upload-service-image`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          alert("Error uploading service image");
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrlToSave = uploadData.image_url || "";
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
          imageURL: imageUrlToSave,
        }),
      });

      if (res.ok) {
        alert("Service added successfully!");
        fetchServices();
        setServiceName("");
        setDocuments("");
        setPrice("");
        setDuration("");
        setDescription("");
        setImageURL("");
        setServiceImageFile(null);
      } else {
        const err = await res.json();
        alert(err.detail || "Error adding service");
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
        alert("Service deleted successfully!");
        fetchServices();
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // ======= SLIDER IMAGES ==========
  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/images`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return alert("Select a file first!");
    const formData = new FormData();
    formData.append("file", selectedFile);

    await fetch(`${BACKEND_URL}/upload-image`, {
      method: "POST",
      body: formData,
    });

    alert("Image uploaded successfully!");
    fetchImages();
  };

  const handleDeleteImage = async (imageName) => {
    const confirmDelete = window.confirm("Are you sure to delete this image?");
    if (!confirmDelete) return;

    await fetch(`${BACKEND_URL}/delete-image/${imageName}`, {
      method: "DELETE",
    });

    alert("Image deleted successfully!");
    fetchImages();
  };

  // ======= PAGINATION ==========
  const indexOfLastInquiry = currentPage * inquiriesPerPage;
  const indexOfFirstInquiry = indexOfLastInquiry - inquiriesPerPage;

  const filteredInquiries = inquiries
    .filter(
      (inq) =>
        inq.name.toLowerCase().includes(search.toLowerCase()) ||
        inq.mobile.includes(search)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const currentInquiries = filteredInquiries.slice(
    indexOfFirstInquiry,
    indexOfLastInquiry
  );

  const totalPages = Math.ceil(filteredInquiries.length / inquiriesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ======= LOAD DATA WHEN LOGGED IN + SECTION CHANGES ==========
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeSection === "inquiries") fetchInquiries();
    if (activeSection === "services") fetchServices();
    if (activeSection === "slider") fetchImages();
  }, [isLoggedIn, activeSection, fetchInquiries, fetchServices, fetchImages]);

  // ======= LOGIN UI ==========
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
        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          Use <b>sm</b> / <b>sm123</b>
        </p>
      </div>
    );
  }

  // ======= MAIN ADMIN UI ==========
  return (
    <div className="admin-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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

      {/* INQUIRIES SECTION */}
      {activeSection === "inquiries" && (
        <div className="inquiries-section">
          <h2>Inquiries</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {inquiries.length === 0 ? (
            <p>No inquiries found.</p>
          ) : (
            <>
              <table border="1" cellPadding="10">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInquiries.map((inq) => (
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
              <div>
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* SERVICES SECTION */}
      {activeSection === "services" && (
        <div className="services-section">
          <h2>Manage Services</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <div>
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

            {/* Optional text URL */}
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />

            {/* Service image upload (separate from slider) */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setServiceImageFile(e.target.files[0])}
            />

            <button onClick={addService}>Add Service</button>
          </div>

          {services.length > 0 && (
            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Documents</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Description</th>
                  <th>Image</th>
                  <th>Action</th>
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
                        <img src={s.imageURL} alt={s.serviceName} width="50" />
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
          )}
        </div>
      )}

      {/* SLIDER IMAGES SECTION */}
      {activeSection === "slider" && (
        <div className="slider-section">
          <h2>Manage Slider Images</h2>
          <button onClick={() => setActiveSection(null)}>⬅ Back</button>

          <div style={{ marginBottom: "15px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={handleUpload}>Upload</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {images.map((url, index) => {
              const fileName = url.split("/").pop();
              return (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt={`slide-${index}`}
                    width="150"
                    style={{ borderRadius: "8px", border: "1px solid #ccc" }}
                  />
                  <button
                    onClick={() => handleDeleteImage(fileName)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "4px 6px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
