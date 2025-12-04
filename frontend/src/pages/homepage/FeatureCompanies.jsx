import { useRef, useState, useEffect } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NextArrow = ({ onClick, show }) => {
  if (!show) return null;
  return (
    <div
      onClick={onClick}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-[#1e88e5] text-[#1e88e5] shadow-md rounded-full p-2 cursor-pointer hover:bg-[#1e88e5] hover:text-white duration-300"
    >
      <ChevronRight size={20} />
    </div>
  );
};

const PrevArrow = ({ onClick, show }) => {
  if (!show) return null;
  return (
    <div
      onClick={onClick}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border-[#1e88e5] text-[#1e88e5] border shadow-md rounded-full p-2 cursor-pointer hover:bg-[#1e88e5] hover:text-white duration-300"
    >
      <ChevronLeft size={20} />
    </div>
  );
};

export default function FeaturedCompanies() {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [companies, setCompanies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(5);

  // Added — fix refresh: wait rendering until width detected
  const [isReady, setIsReady] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch API
  useEffect(() => {
    axios
      .get(`${API_URL}/accounts-employer/company/`)
      .then((res) => setCompanies(res.data.companies || []))
      .catch((err) => console.error("Error fetching companies:", err));
  }, []);

  // FIX refresh issue: detect screen width BEFORE showing slider
  useEffect(() => {
    function updateSlides() {
      const width = window.innerWidth;

      if (width < 480) setSlidesToShow(1);
      else if (width < 640) setSlidesToShow(2);
      else if (width < 1024) setSlidesToShow(3);
      else if (width < 1280) setSlidesToShow(4);
      else setSlidesToShow(5);
    }

    updateSlides(); // run before showing slider
    setIsReady(true); // allow slider to render after width detection

    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  if (!isReady) return null; // prevent wrong first render

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
  };

  const lastSlideIndex = companies.length - slidesToShow;

  return (
    <div className="relative px-4 py-4">
      {/* Prev Arrow */}
      <PrevArrow
        onClick={() => sliderRef.current.slickPrev()}
        show={currentSlide !== 0}
      />

      {/* Slider Companies */}
      <Slider ref={sliderRef} {...settings}>
        {companies.map((company, i) => (
          <div key={i} className="px-3">
            <div
              onClick={() => navigate(`/companies/${company.id}`)}
              className="border company-border-custom rounded-3xl shadow-md text-center py-4 bg-white flex flex-col gap-[10px] items-center justify-center cursor-pointer"
            >
              <img
                src={company.logo || "/default-logo.png"}
                alt={
                  company.business_name.length > 12
                    ? company.business_name.substring(0, 12) + "..."
                    : company.business_name
                }
                className="h-12 mb-1.5 mx-auto object-contain"
              />

              <h3 className="font-semibold text-lg">
                {company.business_name?.length > 12
                  ? company.business_name.substring(0, 12) + "..."
                  : company.business_name || "Unknow Company"}
              </h3>

              <p className="text-sm mb-1">
                {company.industry || "No industry info"}
              </p>

              <button className="px-10 py-1.5 border rounded-xl bg-white feacture-company-color cursor-pointer hover:font-medium">
                {company.job_count || 0} jobs
              </button>
            </div>
          </div>
        ))}
      </Slider>

      {/* Next Arrow */}
      <NextArrow
        onClick={() => sliderRef.current.slickNext()}
        show={currentSlide < lastSlideIndex}
      />
    </div>
  );
}
