import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";


function Home() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/images`)
      .then((res) => res.json())
      .then((data) => setImages(data.images));
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
        {images.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`slide-${index}`}
             style={{width: "75%",height: "300px",objectFit: "cover",display: "block",margin: "0 auto"}}
            />
          </div>
        ))}
      </Slider>

      <div className="banner">
        <h1>Welcome to SM Motor Driving School</h1>
        <p>Learn to drive safely and confidently!</p>
      </div>
    </div>
  );
}

export default Home;
