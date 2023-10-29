'use client'

import About from "@/components/portfolio/about/About";
import Banner from "@/components/portfolio/banner/Banner";
import Contact from "@/components/portfolio/contact/Contact";
import Projects from "@/components/portfolio/projects/Projects";
import Skills from "@/components/portfolio/skills/Skills";
import { sectionObserver, visibilityObserver } from "@/utils/observer";
import { useContext, useEffect } from "react";
import { ThemeContext } from "./theme-provider";

export default function Home() {
  const { darkMode } = useContext(ThemeContext);
  useEffect(() => {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const sectionMark = document.querySelectorAll('.current-section');
      visibilityObserver(sections, 0.2);
      sectionObserver(sectionMark);
    }, 1000);
  });
  return (
    <div id={darkMode ? 'dark' : 'light'}>
      <Banner />
      <Skills />
      <Projects />
      <About />
      <Contact />
    </div>
  )
}
