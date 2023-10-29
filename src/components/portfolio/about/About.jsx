'use client'

import { useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import './about.css';
import Image from 'next/image';
import me from 'public/images/me.jpg';
import colorSharp2 from 'public/images/color-sharp2.png'
import { ThemeContext } from '@/app/theme-provider';

const About = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <section id="about">
      <span className="current-section" id="current-section-about" style={{marginTop: "-10%"}} />
      <Container>
        <h2 className="d-block d-md-none">About me</h2>
        <Row className="align-items-center">
          <Col xs={12} md={6} className="mb-1">
            <h2 className="d-none d-md-block">About me</h2>
            <p>
              My name is George M&apos;sapenda. I live in Lusaka,
              Zambia but I call many places home.
              I love to code, excercise, and read Stephen King novels.
            </p>
            <p>
              I double majored in Library & Information Science and Demography before
              deciding to follow my passion for coding.
              I&apos;m currenlty a certified full-stack
              developer with a mission to create and contribute to meaningful technology solutions
              that make a positive impact.
            </p>
            <p>
              I embrace diversity and collaboration,
              I&apos;m great with documentation, and proficient in a range
              of modern technologies including Javacsript, Ruby, Python, and SQL.
            </p>
            <a href="/docs/Resume.pdf" target="_blank" rel="noreferrer" className="btn btn-info">
              Download my resume
            </a>
          </Col>
          <Col xs={12} md={6} className="mb-1">
            <Image src={me} alt="George Msapenda" loading="lazy" quality={100} />
          </Col>
        </Row>
      </Container>
      {darkMode && (<Image src={colorSharp2} alt="background glow" loading="lazy" quality={100} className="bg-right"/>
      )}
    </section>
  );
};

export default About;
