// src/sections/ClubSection.jsx
import {
  Box,
  Button,
  Typography,
  Stack,
  useTheme,
  Grid,
  useMediaQuery,
  Skeleton,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";

import { useEffect, useMemo } from "react";
import { useClubs } from "../../hooks/useClubs";
import dot from "/images/dot.svg";
import clubVideo from "/videos/club.mp4";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='%23111111'/><text x='50%' y='50%' fill='%23ffffff' font-size='36' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>Club</text></svg>";

/** Create a short plain-text snippet from the API's HTML description */
function useHtmlSnippet(html, maxLen = 140) {
  return useMemo(() => {
    if (!html) return "";
    const noTags = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return noTags.length > maxLen
      ? `${noTags.slice(0, maxLen).trim()}…`
      : noTags;
  }, [html, maxLen]);
}

const ClubSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Pull from API — your hook already supports { items: [...] }
  const { clubs, loading, error } = useClubs();

  // Desktop entrance animation
  useEffect(() => {
    if (isMobile) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".club-title",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
      gsap.fromTo(
        ".club-card",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ".club-grid", start: "top 80%" },
        }
      );
    });
    return () => ctx.revert();
  }, [isMobile]);

  const handleNavigate = (club) => {
    const idOrSlug = club?.slug || club?.id;
    if (!idOrSlug) return;
    navigate(`/club/${idOrSlug}`);
  };

  // Mobile coverflow carousel
  const MobileCarousel = () => (
    <Stack
      width="100%"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ position: "relative", backgroundColor: "#000" }}
    >
      <Box
        component="video"
        src={clubVideo}
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "brightness(1)",
        }}
      />

      <Typography
        fontSize="14vw"
        fontWeight={800}
        textAlign="center"
        color="#fff"
        mb={4}
        zIndex={2}
      >
        Clubs
        <span>
          <img
            src={dot}
            alt="dot"
            style={{ width: "15px", height: "15px", marginLeft: "6px" }}
          />
        </span>
      </Typography>

      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        style={{
          width: "90%",
          height: "480px",
          zIndex: 2,
          overflow: "hidden",
          paddingBottom: "20px",
        }}
      >
        {(loading ? Array.from({ length: 3 }) : clubs).map((club, index) => {
          const snippet = useHtmlSnippet(club?.description);
          const image =
            club?.thumbnail ||
            club?.coverImageUrl || // <-- your API field
            club?.bannerUrl ||
            club?.imageUrl ||
            club?.coverUrl ||
            FALLBACK_IMG;

          return (
            <SwiperSlide
              key={index}
              style={{
                background: "#000",
                border: "2px solid #B55725",
                borderRadius: "12px",
                padding: "16px",
                width: "80%",
                boxSizing: "border-box",
              }}
            >
              {loading ? (
                <Stack height="100%" spacing={2}>
                  <Skeleton variant="rectangular" sx={{ height: 200 }} />
                  <Skeleton width="60%" />
                  <Skeleton />
                  <Skeleton />
                  <Skeleton variant="rounded" height={40} />
                </Stack>
              ) : (
                <Stack height="100%" spacing={2} overflow="hidden">
                  <Box
                    component="img"
                    src={image}
                    alt={club?.title || club?.name}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <Typography
                    fontWeight={700}
                    fontSize="5vw"
                    color="#fff"
                    noWrap
                  >
                    {club?.title || club?.name}
                  </Typography>
                  <Typography
                    fontSize="4vw"
                    color="#ccc"
                    lineHeight={1.4}
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {snippet}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigate(club)}
                    fullWidth
                    sx={{
                      backgroundColor: "#B55725",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "4vw",
                      textTransform: "none",
                      borderRadius: "5px",
                      "&:hover": { backgroundColor: "#a7491c" },
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </Stack>
  );

  // Desktop grid
  const DesktopGrid = () => (
    <Box position="relative">
      <Box
        component="video"
        src={clubVideo}
        autoPlay
        muted
        loop
        playsInline
        sx={{ maxHeight: "150vh", width: "100%", objectFit: "cover" }}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={2}
      >
        <Typography
          className="club-title"
          textAlign="center"
          fontSize={80}
          color="#fff"
          fontWeight={800}
        >
          Clubs
        </Typography>

        <Grid
          className="club-grid"
          margin="0 auto"
          container
          maxWidth={1000}
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          {(loading ? Array.from({ length: 3 }) : clubs).map((club, index) => {
            const snippet = useHtmlSnippet(club?.description, 180);
            const image =
              club?.thumbnail ||
              club?.coverImageUrl || // <-- your API field
              club?.bannerUrl ||
              club?.imageUrl ||
              club?.coverUrl ||
              FALLBACK_IMG;

            return (
              <Grid size={6} key={index}>
                <Box
                  className="club-card"
                  position="relative"
                  height={450}
                  sx={{
                    overflow: "hidden",
                    bgcolor: "#000",
                    "&:hover .club-image": {
                      transform: "scale(1.1)",
                      filter: "brightness(0.4)",
                    },
                    "&:hover .slide-top": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                    "&:hover .slide-left": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                    "&:hover .slide-bottom": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {loading ? (
                    <Skeleton variant="rectangular" height="100%" />
                  ) : (
                    <>
                      <Box
                        component="img"
                        src={image}
                        className="club-image"
                        alt={club?.title || club?.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease, filter 0.4s ease",
                        }}
                      />
                      <Box
                        className="slide-top"
                        sx={{
                          position: "absolute",
                          top: "30%",
                          left: 0,
                          width: "100%",
                          px: 2,
                          py: 1,
                          color: "#fff",
                          opacity: 0,
                          transform: "translateY(-30px)",
                          transition: "all 0.4s ease",
                        }}
                      >
                        <Typography fontSize="2vw" fontWeight={800}>
                          {club?.title || club?.name}
                        </Typography>
                      </Box>
                      <Box
                        className="slide-left"
                        sx={{
                          position: "absolute",
                          transform: "translateX(-30px)",
                          top: "45%",
                          left: 0,
                          width: "100%",
                          px: 2,
                          color: "#fff",
                          opacity: 0,
                          transition: "all 0.4s ease",
                        }}
                      >
                        <Typography fontSize="1vw" fontWeight={400}>
                          {snippet}
                        </Typography>
                      </Box>
                      <Box
                        className="slide-bottom"
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "100%",
                          px: 2,
                          pb: 2,
                          color: "#fff",
                          opacity: 0,
                          transform: "translateY(30px)",
                          transition: "all 0.4s ease",
                        }}
                      >
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleNavigate(club)}
                          sx={{
                            backgroundColor: "#B55725",
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#a7491c" },
                          }}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {!loading && !error && clubs.length === 0 && (
          <Typography color="#fff" mt={2}>
            No clubs yet — check back soon.
          </Typography>
        )}
        {error && (
          <Typography color="#fff" mt={2}>
            Failed to load clubs. Please try again.
          </Typography>
        )}
      </Box>
    </Box>
  );

  return isMobile ? <MobileCarousel /> : <DesktopGrid />;
};

export default ClubSection;
