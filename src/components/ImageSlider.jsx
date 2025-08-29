import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

/**
 * ImageSlider
 *
 * @param {string[]} images       - Array of image paths (e.g. ["mrn.png", "optimalMinds.png", "socialDining.png"])
 * @param {string}   direction    - "vertical", "horizontal", or "random" (default)
 * @param {boolean}  clickable    - If true, parallax on hover and click to redirect
 * @param {string}   redirect     - The route to navigate on click (if clickable=true)
 *
 */
const ImageSlider = ({
  images = [],
  direction = "horizontal",
  clickable = false,
  redirect = "",
}) => {
  const sliderRef = useRef(null);
  const currentIndexRef = useRef(0);
  const imageRefs = useRef([]);
  const timeoutRef = useRef(null);

  const navigate = useNavigate();
  const objectFitValue = direction === "vetical" ? "contain" : "contain";

  // Handle the internal redirect via React Router
  const handleRedirect = useCallback(() => {
    navigate(redirect);
  }, [navigate, redirect]);

  useEffect(() => {
    // If no images, no animation
    if (!images.length) return;

    // Determine direction(s)
    let availableDirections = [];
    if (direction === "vertical") {
      availableDirections = ["top", "bottom"];
    } else if (direction === "horizontal") {
      availableDirections = ["left", "right"];
    } else {
      // random or default
      availableDirections = ["top", "bottom", "left", "right"];
    }

    const animateSlide = () => {
      const currentIndex = currentIndexRef.current;
      const nextIndex = (currentIndex + 1) % images.length;
      currentIndexRef.current = nextIndex;

      // Pick a random direction from the available directions
      const selectedDirection =
        availableDirections[
          Math.floor(Math.random() * availableDirections.length)
        ];

      let fromProps = {};
      let toProps = {
        opacity: 1,
        x: "0%",
        y: "0%",
        duration: 1,
        ease: "power2.inOut",
      };

      // Animate the "current" image off-screen:
      if (selectedDirection === "top") {
        fromProps = { y: "-100%", opacity: 1 };
        gsap.to(imageRefs.current[currentIndex], {
          y: "100%",
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        });
      } else if (selectedDirection === "bottom") {
        fromProps = { y: "100%", opacity: 1 };
        gsap.to(imageRefs.current[currentIndex], {
          y: "-100%",
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        });
      } else if (selectedDirection === "left") {
        fromProps = { x: "-100%", opacity: 1 };
        gsap.to(imageRefs.current[currentIndex], {
          x: "100%",
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        });
      } else if (selectedDirection === "right") {
        fromProps = { x: "100%", opacity: 1 };
        gsap.to(imageRefs.current[currentIndex], {
          x: "-100%",
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        });
      }

      // Animate the "next" image onto the screen:
      gsap.fromTo(imageRefs.current[nextIndex], fromProps, toProps);

      // Random delay (2s - 4s) for the next cycle
      const randomDelay = Math.floor(Math.random() * 2001) + 2000;

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(animateSlide, randomDelay);
    };

    // Kick off the first animation
    animateSlide();

    // Cleanup on unmount
    return () => clearTimeout(timeoutRef.current);
  }, [images, direction]);

  // ======= Parallax & Click Logic =======
  const handleMouseMove = useCallback(
    (e) => {
      if (!clickable) return;
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const xPos = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const yPos = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 .. 0.5

      const moveX = xPos * 20; // a multiplier for parallax effect
      const moveY = yPos * 20;

      gsap.to(sliderRef.current, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        overwrite: true,
      });
    },
    [clickable]
  );

  const handleMouseLeave = useCallback(() => {
    if (!clickable) return;

    // Move back to center
    gsap.to(sliderRef.current, {
      x: 0,
      y: 0,
      duration: 0.4,
      overwrite: true,
    });
  }, [clickable]);

  const handleClick = useCallback(() => {
    if (!clickable) return;
    handleRedirect();
  }, [clickable, handleRedirect]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="slider-section">
      <div
        ref={sliderRef}
        className="slider-container"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          cursor: clickable ? "pointer" : "default",
        }}
        onMouseMove={clickable ? handleMouseMove : undefined}
        onMouseLeave={clickable ? handleMouseLeave : undefined}
        onClick={clickable ? handleClick : undefined}
      >
        {images.map((src, index) => (
          <img
            key={index}
            ref={(el) => (imageRefs.current[index] = el)}
            src={src}
            alt={`Slide ${index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
