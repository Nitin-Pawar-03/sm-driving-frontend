import React, { useState } from "react";
import "./Contact.css";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";


function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.message);
      setFormData({ name: "", email: "", mobile: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="contact">
      <h2>Contact Us</h2>
      <p>Reach out to us via WhatsApp, Call, or the form below:</p>

      <div className="contact-buttons">
        <a href="https://wa.me/918530121384" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
          WhatsApp
        </a>
        <a href="tel:+918530121384" className="call-btn">
          Call Now
        </a>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;
