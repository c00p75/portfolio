import './projects.css';
import {
  Col, Container, Row, Nav, Tab,
} from 'react-bootstrap';
import { useContext, useState, useEffect } from 'react';
import projects from '../../constants/projects';
import colorSharp2 from '../../assets/images/color-sharp2.png';
import { ThemeContext } from '../ThemeContext';
import ProjectModal from './ProjectModal';
import { projectCardObserver } from '../../constants/observer';

const Projects = () => {
  const { darkMode } = useContext(ThemeContext);
  const [showProject, setShowProject] = useState(false);
  const [project, setProject] = useState(null);
  useEffect(() => {
    const projectCards = document.querySelectorAll('.project-img-box');
    projectCardObserver(projectCards);
  });

  return (
    <section id="projects">
      <div><ProjectModal className="bg-dark" /></div>
      <Container>
        <Row>
          <Col>
            <h2>Projects</h2>
            <p>
              This section of the protfolio showcases my ability to excel independently
              and thrive in the collaborative spirit of remote teams.
              Each personal and collaborative project allowed me to explore new technologies,
              solve a unique challenge, and experiment with unique concepts.
              I&apos;m excited to share share my journey with you.
            </p>
            <Tab.Container id="projects-tab" defaultActiveKey="frontend">
              <Nav variant="pills" className="mb-5">
                <Nav.Item>
                  <Nav.Link eventKey="frontend">Front-End</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="backend">Back-End</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fullstack">Full-Stack</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="frontend">
                  <Row>
                    {projects.frontend.map((project, index) => (
                      <Col sm={6} md={4} key={`item-${index + 1}`}>
                        <div
                          className="project-img-box"
                          role="button"
                          tabIndex={0}
                          onClick={() => { setShowProject(true); setProject(project); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setShowProject(true); setProject(project); } }}
                        >
                          <img src={project.img} alt={project.name} />
                          <div className="project-text d-flex flex-column">
                            <h4>{project.title}</h4>
                            <span>{project.summary}</span>
                            <div className="tech-stack d-flex flex-row justify-content-center">
                              {project.stack.map((stack, index) => (
                                <img src={stack[1]} alt="icon" key={`item-${index + 1}`} style={{ zIndex: -index }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>

                <Tab.Pane eventKey="backend">
                  <Row>
                    {projects.backend.map((project, index) => (
                      <Col sm={6} md={4} key={`item-${index + 1}`}>
                        <div
                          className="project-img-box"
                          role="button"
                          tabIndex={0}
                          onClick={() => { setShowProject(true); setProject(project); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setShowProject(true); setProject(project); } }}
                        >
                          <img src={project.img} alt={project.name} />
                          <div className="project-text d-flex flex-column">
                            <h4>{project.title}</h4>
                            <span>{project.summary}</span>
                            <div className="tech-stack d-flex flex-row justify-content-center">
                              {project.stack.map((stack, index) => (
                                <img src={stack[1]} alt="icon" key={`item-${index + 1}`} style={{ zIndex: -index }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>

                <Tab.Pane eventKey="fullstack">
                  <Row>
                    {projects.fullstack.map((project, index) => (
                      <Col sm={6} md={4} key={`item-${index + 1}`}>
                        <div
                          className="project-img-box"
                          role="button"
                          tabIndex={0}
                          onClick={() => { setShowProject(true); setProject(project); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { setShowProject(true); setProject(project); } }}
                        >
                          <img src={project.img} alt={project.name} />
                          <div className="project-text d-flex flex-column">
                            <h4>{project.title}</h4>
                            <span>{project.summary}</span>
                            <div className="tech-stack d-flex flex-row justify-content-center">
                              {project.stack.map((stack, index) => (
                                <img src={stack[1]} alt="icon" key={`item-${index + 1}`} style={{ zIndex: -index }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
      {darkMode && (<img src={colorSharp2} alt="background" className="bg-right" />)}
      {project && (<ProjectModal show={showProject} setShow={setShowProject} project={project} />)}
    </section>
  );
};

export default Projects;
