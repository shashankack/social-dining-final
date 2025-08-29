import { useLayoutEffect, useRef, useEffect } from "react";
import { Stack, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import gsap from "gsap";
import ImageSlider from "../ImageSlider";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import aboutVideo from "/videos/about.mp4";
import dot from "/images/dot.svg";
import slide1 from "/images/about_slide/slide_1.png";
import slide2 from "/images/about_slide/slide_2.png";
import slide3 from "/images/about_slide/slide_3.png";
import slide4 from "/images/about_slide/slide_4.png";
import slide5 from "/images/about_slide/slide_5.png";
import slide6 from "/images/about_slide/slide_6.png";
const AboutSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const containerRef = useRef(null);
  const followerRef = useRef(null);
  const sliderRef = useRef(null);

  const slides = [slide1, slide2, slide3, slide4, slide5, slide6];

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Vertical images slide
  useLayoutEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let tween;

    const buildTween = () => {
      const total = slider.scrollHeight / 2;
      if (!total) return;

      tween?.kill();
      gsap.set(slider, { y: 0 });
      tween = gsap.to(slider, {
        y: -total,
        duration: 20,
        ease: "none",
        repeat: -1,
        modifiers: { y: gsap.utils.unitize((v) => parseFloat(v) % -total) },
      });
    };

    buildTween();

    const imgs = slider.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", buildTween);
    });

    const ro = new ResizeObserver(buildTween);
    ro.observe(slider);

    return () => {
      tween?.kill();
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", buildTween));
    };
  }, []);

  // Mouse follower effect
  useLayoutEffect(() => {
    const container = containerRef.current;
    const follower = followerRef.current;
    if (!container || !follower) return;

    const { offsetWidth: fw, offsetHeight: fh } = follower;

    const enter = () =>
      gsap.to(follower, { scale: 1, duration: 0.4, ease: "power2.out" });

    const move = (e) => {
      const rect = container.getBoundingClientRect();
      const x = Math.min(
        Math.max(e.clientX - rect.left - fw / 2, 0),
        rect.width - fw
      );
      const y = Math.min(
        Math.max(e.clientY - rect.top - fh / 2, 0),
        rect.height - fh
      );

      gsap.to(follower, { x, y, duration: 0.3, ease: "power2.out" });
    };

    const leave = () =>
      gsap.to(follower, { scale: 0, duration: 0.4, ease: "power2.in" });

    container.addEventListener("mouseenter", enter);
    container.addEventListener("mousemove", move);
    container.addEventListener("mouseleave", leave);

    return () => {
      container.removeEventListener("mouseenter", enter);
      container.removeEventListener("mousemove", move);
      container.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <Box overflow="hidden" id="about">
      {isMobile || isTablet ? (
        <Stack width="100%" direction="column-reverse" p={2} spacing={4}>
          {/* Description Section */}
          <Stack direction="column" width="100%">
            <Typography
              variant="body2"
              fontSize="4vw"
              textAlign="justify"
              color="#fff"
              lineHeight={1.6}
              sx={{
                letterSpacing: "0.02em",

                "& strong": { color: "#B55725" },
              }}
            >
              Welcome to <strong>Social Dining</strong>, where connections are
              curated and experiences are unforgettable. We are a premium social
              club designed for a carefully selected circle of individuals who
              crave meaningful interactions, indulgent experiences, and a
              vibrant community.
              <br />
              <br />
              We bring together people from diverse industries and backgrounds,
              fostering a space for networking, fun, and collaboration. Whether
              you’re an entrepreneur, fitness enthusiast, foodie, or someone who
              enjoys lively conversation, our exclusive clubs offer something
              for everyone.
            </Typography>
          </Stack>

          {/* Slider Section */}
          <Box
            width="100%"
            height={300}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "2px solid #B55725",
              boxShadow: 3,
            }}
          >
            <ImageSlider images={slides} direction="" />
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            fontWeight={800}
            fontSize="10vw"
            textAlign="center"
            color="#fff"
          >
            About Us
            <span>
              <img
                src={dot}
                alt="dot"
                style={{
                  objectFit: "contain",
                  width: "2vw",
                  height: "2vw",
                  marginLeft: "1vw",
                }}
              />
            </span>
          </Typography>
        </Stack>
      ) : (
        <Box height="100vh" position="relative">
          <Box
            component="video"
            src={aboutVideo}
            autoPlay
            muted
            playsInline
            loop
          />

          <Box
            right={60}
            top={0}
            width={300}
            height="100vh"
            position="absolute"
            overflow="hidden"
            p={2}
            sx={{
              zIndex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Box ref={sliderRef} display="flex" flexDirection="column">
              {[...slides, ...slides].map((img, i) => (
                <Box key={i} mb={2} height={260}>
                  <Box
                    component="img"
                    src={img}
                    alt={`slide-${i}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      boxShadow: "6px 6px 10px 1px rgba(0,0,0,0.4)",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            ref={containerRef}
            className="about-container"
            position="absolute"
            top="10vh"
            left="6vw"
            width="75%"
            height="80%"
            overflow="hidden"
            sx={{
              cursor: "none",
            }}
          >
            <Box
              ref={followerRef}
              sx={{
                width: "20vw",
                height: "55vh",
                padding: "20px",
                bgcolor: "black",
                boxShadow: "6.348px 6.348px 0px #B55725",
                position: "absolute",
                top: 0,
                left: 0,
                transform: "scale(0)",
                pointerEvents: "none",
              }}
            >
              <Typography variant="h3" color="white" fontWeight={700}>
                About Us
                <span>
                  <img
                    src={dot}
                    style={{
                      width: "3%",
                      marginLeft: "3px",
                      objectFit: "contain",
                    }}
                    alt="dot"
                  />
                </span>
              </Typography>
              <div data-animate>
                <Typography
                  variant="h5"
                  fontSize={isMobile ? "1.2vw" : "1vw"}
                  fontWeight={300}
                  mt={3}
                  lineHeight={1.1}
                  color="#dddddd"
                  sx={{ "& span": { color: "#B55725" } }}
                >
                  Welcome to Social Dining, where connections are curated and
                  experiences are unforgettable. We are a premium social club
                  designed for a carefully selected circle of individuals who
                  crave meaningful interactions, indulgent experiences, and a
                  vibrant community. We bring together people from diverse
                  industries and backgrounds, fostering a space for networking,
                  fun, and collaboration. Whether you’re an entrepreneur,
                  fitness enthusiast, foodie, or someone who enjoys lively
                  conversation, our exclusive clubs offer something for everyone
                  <span>.</span>
                </Typography>
              </div>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AboutSection;
