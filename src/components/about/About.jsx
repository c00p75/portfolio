import { useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import me from '../../assets/images/me.jpg';
import resume from '../../assets/docs/Resume.pdf';
import colorSharp2 from '../../assets/images/color-sharp2.png';
import './about.css';
import { ThemeContext } from '../ThemeContext';

const About = () => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <section id="about">
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
            <a href={resume} target="_blank" rel="noreferrer" className="btn btn-info">Download my resume</a>
          </Col>
          <Col xs={12} md={6} className="mb-1">
            <img src={me} alt="George M'sapenda" loading="lazy" />
          </Col>
        </Row>
      </Container>
      {darkMode && (<img src={colorSharp2} alt="background" className="bg-right" loading="lazy" />)}
    </section>
  );
};

export default About;
