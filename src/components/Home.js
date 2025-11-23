import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";

function Home() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/slider-images`)
      .then((res) => res.json())
      .then((data) => setImages(data.images || []));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2200,
  };

  return (
    <div className="home">
      <Slider {...settings}>
        {images.map((img) => (
          <div key={img._id}>
            <img
              src={img.url}
              alt="slide"
              style={{
                width: "75%",
                height: "300px",
                objectFit: "cover",
                display: "block",
                margin: "0 auto",
                borderRadius: "8px",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Home;
