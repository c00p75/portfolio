import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext, useEffect } from 'react';
import Banner from './components/banner/Banner';
import NavBar from './components/navbar/NavBar';
import Skills from './components/skills/Skills';
import Projects from './components/projects/Projects';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';
import { ThemeContext } from './components/ThemeContext';
import { sectionObserver, visibilityObserver } from './constants/observer';
import About from './components/about/About';

function App() {
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
    <div className="App" id={darkMode ? 'dark' : 'light'}>
      <NavBar />
      <Banner />
      <Skills />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
