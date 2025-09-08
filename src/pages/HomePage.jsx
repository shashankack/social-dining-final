import React from "react";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import EventsSection from "../components/sections/EventsSection";
import ClubSection from "../components/sections/ClubsSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <EventsSection />
      <ClubSection />
    </>
  );
};

export default HomePage;
