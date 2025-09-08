import {
  Box,
  Typography,
  useMediaQuery,
  Stack,
  Button,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  Grid,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

import hotMom from "../assets/images/clubs/hotMom.png";
import foudnersClub from "../assets/images/clubs/founders.png";
import fitnessClub from "../assets/images/clubs/fitness.png";
import supperClub from "../assets/images/clubs/supper.png";

import hotMomReel from "../assets/videos/clubs/hot_moms.mp4";
import fitnessReel from "../assets/videos/clubs/fitness.mp4";
import foundersReel from "../assets/videos/clubs/founders.mp4";
import supperReel from "../assets/videos/clubs/supper.mp4";

import hotMom1 from "../assets/images/clubs/hotMom/hotMom1.png";
import hotMom2 from "../assets/images/clubs/hotMom/hotMom2.png";
import hotMom3 from "../assets/images/clubs/hotMom/hotMom3.jpg";
import hotMom4 from "../assets/images/clubs/hotMom/hotMom4.png";
import hotMom5 from "../assets/images/clubs/hotMom/hotMom5.png";
import hotMom6 from "../assets/images/clubs/hotMom/hotMom6.png";
import hotMom7 from "../assets/images/clubs/hotMom/hotMom7.png";
import hotMom8 from "../assets/images/clubs/hotMom/hotMom8.png";

import founder1 from "../assets/images/clubs/founders/founder1.png";
import founder2 from "../assets/images/clubs/founders/founder2.png";
import founder3 from "../assets/images/clubs/founders/founder3.png";
import founder4 from "../assets/images/clubs/founders/founder4.png";

import fitness1 from "../assets/images/clubs/fitness/fitness1.png";
import fitness2 from "../assets/images/clubs/fitness/fitness2.png";
import fitness3 from "../assets/images/clubs/fitness/fitness3.png";
import fitness4 from "../assets/images/clubs/fitness/fitness4.png";

// import supper1 from "../assets/images/clubs/supper/supper1.jpg";
import supper1 from "../assets/images/clubs/supper/supper1.png";
import supper2 from "../assets/images/clubs/supper/supper2.png";
import supper3 from "../assets/images/clubs/supper/supper3.jpg";
import supper4 from "../assets/images/clubs/supper/supper4.jpg";

import { getClubs, registerForClub } from "../services/clubService";
import { getCurrentUser, isAuthenticated } from "../services/authService";
import Loader from "./Loader";

const clubData = [
  {
    thumbnail: hotMom,
    reel: hotMomReel,
    title: "Hot Moms Club",
    description:
      "Welcome to the Hot Moms Club a space where moms can unwind, connect, and have fun. While your little ones enjoy their own playground area, you get to mingle, share stories, and make new friends. Whether you’re bonding with your kids or enjoying some “me-time,” there’s something for everyone!",
    whatWeOffer: `<ul>
          <li>
            <strong>Kids’ Playground:</strong> A safe space for your little ones
            to play and bond while you relax and connect with other moms.
          </li>
          <li>
            <strong>Mom-Focused Activities:</strong> Take a break with events
            designed just for you—whether it’s a wellness session, creative
            workshop, or simply a chance to recharge
          </li>
          <li>
            <strong>Delicious Meals:</strong> Enjoy curated dining experiences
            with healthy, delicious food that’s sure to satisfy
          </li>
          <li>
            <strong>Fun Experiences:</strong> Whether it’s tarot readings, group
            activities, or a surprise experience, we add a little magic and fun
            to every gathering.
          </li>
          <li>
            <strong>Great Music & Vibes:</strong> Enjoy good music and a relaxed
            atmosphere that makes it easy to connect and unwind.
          </li>
        </ul>
        The Hot Moms Club is all about celebrating you connecting with other
        amazing moms, having fun with your kids, and taking some time for
        yourself`,
    images: [
      hotMom1,
      hotMom2,
      hotMom3,
      hotMom4,
      hotMom5,
      hotMom6,
      hotMom7,
      hotMom8,
    ],
  },
  {
    thumbnail: foudnersClub,
    reel: foundersReel,
    title: "Founders Club",
    description:
      "The Founders Club is a dynamic space where visionary entrepreneurs, startup founders, and business creators come together to share ideas, collaborate, and inspire one another. This is not just a club; it’s a thriving ecosystem for growth, innovation, and success",
    whatWeOffer: `<ul>
        <li>
          <strong>Engaging Conversations:</strong> Interact with fellow founders
          and entrepreneurs who are shaping the future. Exchange ideas,
          challenges, and solutions in a relaxed, open environment
        </li>
        <li>
          <strong>Vibrant Atmosphere:</strong> Enjoy great music, delectable
          food, and drinks while networking and building meaningful connections.
        </li>
        <li>
          <strong>Networking and Idea Sharing:</strong> Expand your circle with
          like-minded individuals and spark collaborations that could take your
          business to the next level.
        </li>
      </ul>
      The Founders Club is more than just a space; it’s an opportunity to build,
      connect, and grow with the leaders of tomorrow`,
    images: [founder1, founder2, founder3, founder4],
  },
  {
    thumbnail: fitnessClub,
    reel: fitnessReel,
    title: "Fitness Club",
    description:
      "Get ready to elevate your fitness journey with our Fitness Club, where we focus on holistic well-being body, mind and soul. Our exclusive offerings are tailored to help you achieve your fitness goals while enjoying a supportive and fun community.",
    whatWeOffer: `<ul>
        <li>
        <strong>Fitness & Wellness Programs:</strong> From yoga to strength training, our fitness programs are curated to help you stay active, healthy, and strong. Whether you’re a fitness newbie or a seasoned pro, there’s something for everyone.
        </li>
        <li>
          <strong>Healthy & Delicious Food:</strong> Fuel your body with nutritious, tasty meals
          designed to complement your workout. Enjoy wholesome, delicious food
          that keeps you feeling energized.
        </li>
        <li>
          <strong>Fun Group Activities:</strong> Fitness isn’t just about working out—it’s about
          enjoying the process! Participate in group activities like fitness
          challenges, dance classes, and outdoor events that keep you moving and
          having fun.
        </li>
        <li>
          <strong>Supportive Community:</strong> Join a community that’s as committed to wellness
          as you are. Whether you’re aiming for weight loss, toning, or simply
          leading a healthier lifestyle, the Fitness Club provides a space for
          you to thrive.
        </li>
      </ul>
      In the Fitness Club, we focus on fun, fitness, and well-being, making
      every session enjoyable and every achievement worth celebrating`,
    images: [fitness1, fitness2, fitness3, fitness4],
  },
  {
    thumbnail: supperClub,
    reel: supperReel,
    title: "Vegetarian Omakase Club",
    description:
      "The Vegetarian Omakase Club is where food, conversation, and fun activities collide. Every event is a curated dining experience, designed not only to satisfy your palate but also to offer you the chance to mingle, have fun, and create lasting memories",
    whatWeOffer: `<ul>
        <li>
          <strong>Curated Dinner Experiences:</strong> Thoughtfully prepared
          dinners, featuring everything from gourmet meals to casual yet
          delicious bites, prepared by top chefs
        </li>
        <li>
          <strong>Fun Conversations & Networking:</strong> This is more than
          just a meal. It’s an opportunity to meet interesting people, share
          experiences, and perhaps even collaborate on something exciting
        </li>
        <li>
          <strong>Relaxed Vibes:</strong> Set in intimate, cozy spaces, our
           club is the perfect environment to unwind, relax and let loose
        </li>
      </ul>
      The Vegetarian Omakase Club is your go-to for delightful conversations, memorable
      moments, and a great time with great food.`,
    images: [supper1, supper2, supper3, supper4],
  },
];
const ClubDetailsPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const data = await getClubs();
        const clubIds = data.getAllClubs.map((club) => club.id);
        const ClubDetailsPage = clubIds.map((clubId, index) => ({
          id: clubId,
          ...clubData[index],
        }));
        const selected = ClubDetailsPage.find((c) => c.id === id);
        setClub(selected);
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load club:", err);
      }
    };

    fetchClub();
  }, [id]);

  const handleClick = async (clubId) => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: `/club/${clubId}` }, // use your route structure
      });
      window.scrollTo(0, 0);
      return;
    }

    try {
      setLoading(true);
      await registerForClub(clubId);
      F;
      setSnackbar({
        open: true,
        message: "Successfully registered for the club!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error registering for club:", error);
      setSnackbar({
        open: true,
        message: "Failed to register. Please try again later.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!club) return <Loader />;
  const isMember = currentUser?.clubId === club.id;

  return (
    <Stack px={isMobile ? 0 : 10} py={10} flexDirection="column">
      <Stack
        direction={isMobile ? "column" : "row"}
        bgcolor="#B55725"
        height={isMobile ? "auto" : 600}
        width="100%"
        p={isMobile ? 0 : 2}
        gap={isMobile ? 0 : 2}
      >
        <Box height="100%" width={isMobile ? "100%" : 500}>
          <Box
            component="video"
            src={club.reel}
            autoPlay
            muted
            loop
            playsInline
          />
        </Box>
        <Stack
          justifyContent="space-between"
          alignItems="start"
          gap={isMobile ? 2 : 0}
          width="100%"
          p={1}
        >
          <Stack
            justifyContent="start"
            alignItems="start"
            gap={isMobile ? 2 : 0}
          >
            <Typography fontWeight={700} fontSize={isMobile ? "6vw" : "3vw"}>
              {club.title}.
            </Typography>
            <Typography
              fontSize={isMobile ? "4vw" : "1.4vw"}
              fontWeight={200}
              textAlign={isMobile ? "justify" : "left"}
            >
              {club.description}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            disabled={loading || isMember}
            endIcon={
              !loading &&
              !isMember && (
                <ArrowOutwardIcon
                  sx={{
                    scale: isMobile ? "1.5" : "2",
                  }}
                />
              )
            }
            sx={{
              color: isMember ? "#fff" : "#B55725",
              bgcolor: isMember ? "#333" : "#fff",
              boxShadow: "none",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 16,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: isMember ? "none" : "scaleX(.99)",
                boxShadow: "none",
              },
            }}
            onClick={() => !isMember && handleClick(club.id)}
          >
            {loading ? (
              <CircularProgress
                size={24}
                thickness={5}
                sx={{ color: "#fff", margin: "0 auto" }}
              />
            ) : isMember ? (
              "Already a Member"
            ) : (
              "Join Now"
            )}
          </Button>
        </Stack>
      </Stack>
      {/* Accordion */}
      <Accordion
        sx={{
          width: "100%",
          my: 4,
          background: "linear-gradient(200deg, #000 0%, #222 100%)",

          color: "#fff",
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon sx={{ color: "#B55725", fontSize: 40 }} />
          }
          aria-controls="club-content"
          id="club-header"
        >
          <Typography fontWeight={700} fontSize={isMobile ? "5vw" : "3vw"}>
            What We Offer
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            component="div"
            dangerouslySetInnerHTML={{ __html: club.whatWeOffer }}
            sx={{
              fontSize: isMobile ? "3.5vw" : "1.2vw",
              lineHeight: isMobile ? "5vw" : "1.6",
              textAlign: "left",
              "& ul": {
                paddingLeft: isMobile ? "2vw" : 2,
                listStyle: "none",
              },
              "& ul li": {
                position: "relative",
                paddingLeft: isMobile ? "5vw" : "1.5vw",
                mb: 1,
              },
              "& ul li::before": {
                content: '"\\27A4"', // ➤
                position: "absolute",
                left: 0,
                color: "#B55725",
                fontSize: isMobile ? "3vw" : "1vw",
                top: "0.1em",
              },
            }}
          />
        </AccordionDetails>
      </Accordion>
      <Grid container p={isMobile ? 0.5 : 0} spacing={isMobile ? 0.5 : 2}>
        {club.images.map((image, index) => {
          const row = Math.floor(index / 2);
          const position = index % 2;

          const isEvenRow = row % 2 === 1;

          const size = isEvenRow
            ? position === 0
              ? 5
              : 7
            : position === 0
            ? 7
            : 5;

          return (
            <Grid
              key={index}
              size={size}
              sx={{
                height: isMobile ? 200 : 500,
                transition: "all 0.3s ease",
                overflow: "hidden",
                "&:hover": {
                  transform: "scale(.97)",
                  "& img": {
                    transform: "scale(1.03)",
                  },
                },
              }}
            >
              <Box
                component="img"
                src={image}
                sx={{
                  transition: "all 0.3s ease",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            width: "100%",
            backgroundColor:
              snackbar.severity === "success" ? "#b55725" : "#d32f2f",
          }}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Stack>
  );
};

export default ClubDetailsPage;
