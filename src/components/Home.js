import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_BASE_URL || "https://sm-driving-backend.onrender.com";

function Home() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function loadSliderImages() {
      try {
        const res = await fetch(`${BACKEND_URL}/slider-images`);
        if (!res.ok) {
          console.error("Failed to fetch slider images");
          setImages([]);
          return;
        }

        const data = await res.json();

        // Extract the URL field from each document
        const urls =
          Array.isArray(data.images) ? data.images.map((img) => img.url) : [];

        setImages(urls);
      } catch (err) {
        console.error("Slider fetch error:", err);
        setImages([]);
      }
    }

    loadSliderImages();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 2200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 500,
  };

  return (
    <div className="home">
      <Slider {...settings}>
        {images.length > 0 ? (
          images.map((url, index) => (
            <div key={index}>
              <img
                src={url}
                alt={`slide-${index}`}
                style={{
                  width: "75%",
                  height: "300px",
                  objectFit: "cover",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
            Loading slider...
          </div>
        )}
      </Slider>

      <div className="banner">
        <h1>Welcome to SM Motor Driving School</h1>
        <p>Learn to drive safely and confidently!</p>
      </div>
    </div>
  );
}

export default Home;
