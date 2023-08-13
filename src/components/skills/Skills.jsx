import './skills.css';
import { Col, Container, Row } from 'react-bootstrap';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useContext, useEffect } from 'react';
import colorSharp from '../../assets/images/color-sharp.png';
import skills from '../../constants/skills';
import { ThemeContext } from '../ThemeContext';
import { scaleObserver } from '../../constants/observer';

const Skills = () => {
  const { darkMode } = useContext(ThemeContext);
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    setTimeout(() => {
      const skills = document.querySelectorAll('.skills-slider .sub-item-container');
      scaleObserver(skills, 0, true);
    }, 1000);
  });

  return (
    <section id="skills">
      <Container>
        <Row>
          <Col>
            <div className="skill-box">
              <h2>
                Skills
              </h2>
              <p>
                Grounded in a commitment to continuous result delivery, growth, and learning,
                I have gained a solid foundation in both front-end
                and back-end technologies and cultivated diverse technical and proffesional skills
                that allow me to tackle complex challenges.
              </p>
              <Carousel responsive={responsive} infinite className="skills-slider">
                <Container className="item">
                  <h3>Front-end</h3>
                  <Row className="d-flex align-items-baseline">
                    {skills.frontend.map((skill, index) => (
                      <Col sm={6} md={3} className="my-3 d-flex flex-column align-items-center justify-content-center sub-item-container" key={`item-${index + 1}`}>
                        <div className="sub-item">
                          <img src={skill.img} alt={skill.name} loading="lazy" />
                        </div>
                        <span>{skill.name}</span>
                      </Col>
                    ))}
                  </Row>
                </Container>

                <Container className="item">
                  <h3>Back-end</h3>
                  <Row className="d-flex align-items-baseline">
                    {skills.backend.map((skill, index) => (
                      <Col sm={6} md={3} className="my-3 d-flex flex-column align-items-center justify-content-center sub-item-container" key={`item-${index + 1}`}>
                        <div className="sub-item">
                          <img src={skill.img} alt={skill.name} loading="lazy" />
                        </div>
                        <span>{skill.name}</span>
                      </Col>
                    ))}
                  </Row>
                </Container>

                <Container className="item">
                  <h3>Tools & Methods</h3>
                  <Row className="d-flex align-items-baseline">
                    {skills.tools.map((skill, index) => (
                      <Col sm={6} md={3} className="my-3 d-flex flex-column align-items-center justify-content-center sub-item-container" key={`item-${index + 1}`}>
                        <div className="sub-item">
                          <img src={skill.img} alt={skill.name} loading="lazy" />
                        </div>
                        <span>{skill.name}</span>
                      </Col>
                    ))}
                  </Row>
                </Container>

                <Container className="item">
                  <h3>Professional Skills</h3>
                  <Row className="d-flex align-items-baseline">
                    {skills.softskills.map((skill, index) => (
                      <Col sm={6} md={3} className="my-3 d-flex flex-column align-items-center justify-content-center sub-item-container" key={`item-${index + 1}`}>
                        <div className="sub-item">
                          <img src={skill.img} alt={skill.name} loading="lazy" />
                        </div>
                        <span>{skill.name}</span>
                      </Col>
                    ))}
                  </Row>
                </Container>
              </Carousel>
            </div>
          </Col>
        </Row>
      </Container>
      {darkMode && (<img className="bg-img-left" src={colorSharp} alt="background" />)}
    </section>
  );
};

export default Skills;
