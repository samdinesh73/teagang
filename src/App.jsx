import { useState } from "react";
import NavBar from "./components/NavBar";
import JoinPopup from "./components/JoinPopup";
import HeroSection from "./sections/HeroSection";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import MessageSection from "./sections/MessageSection";
import FlavorSection from "./sections/FlavorSection";
import { useGSAP } from "@gsap/react";
import NutritionSection from "./sections/NutritionSection";
import BenefitSection from "./sections/BenefitSection";
import TestimonialSection from "./sections/TestimonialSection";
import FooterSection from "./sections/FooterSection";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const App = () => {
  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });
  });

  const [openJoin, setOpenJoin] = useState(false);

  return (
    <main>
      <NavBar onOpen={() => setOpenJoin(true)} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection onOpen={() => setOpenJoin(true)} />
          <MessageSection />
          <FlavorSection />
          <NutritionSection />

          <div>
            <BenefitSection />
            <TestimonialSection />
          </div>

          <FooterSection />
        </div>
      </div>

      <JoinPopup isOpen={openJoin} onClose={() => setOpenJoin(false)} />
    </main>
  );
};

export default App;
