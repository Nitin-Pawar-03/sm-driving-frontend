import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";


function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]); 
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleBookNow = () => {
    setSelectedService(null); 
    navigate("/contact"); 
  };

  return (
    <div className="services">
      <h2>Our Services</h2>

      <div className="service-cards">
        {services.map((service) => (
          <div className="card" key={service._id}>
            <strong>{service.serviceName}</strong>

            {service.imageURL && (
              <img
                src={service.imageURL}
                alt={service.serviceName}
                className="service-image"   // 👈 Added uniform image class
              />
            )}

            <button
              className="view-btn"
              onClick={() => setSelectedService(service)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedService.serviceName}</h3>

            <p><strong>Documents Required:</strong> {selectedService.documents}</p>
            <p><strong>Price:</strong> {selectedService.price}</p>
            <p><strong>Duration:</strong> {selectedService.duration}</p>
            <p><strong>Description:</strong> {selectedService.description}</p>

            <div className="modal-buttons">
              <button onClick={() => setSelectedService(null)}>Close</button>
              <button onClick={handleBookNow} className="book-btn">
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
