import { Modal, Row, Col } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const ProjectModal = ({ show, setShow, project }) => {
  const { darkMode } = useContext(ThemeContext);
  return (
    <Modal show={show} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className={darkMode ? '' : 'light'}>
      {project && (
      <>
        <Modal.Header>
          <h1>{project.title}</h1>
          <button type="button" onClick={() => setShow(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32"><path fill="#696969" d="M16 2C8.2 2 2 8.2 2 16s6.2 14 14 14s14-6.2 14-14S23.8 2 16 2zm5.4 21L16 17.6L10.6 23L9 21.4l5.4-5.4L9 10.6L10.6 9l5.4 5.4L21.4 9l1.6 1.6l-5.4 5.4l5.4 5.4l-1.6 1.6z" /></svg>
          </button>
        </Modal.Header>
        <Modal.Body className="d-flex">
          <Row>
            <Col sm={12} md={6}>
              <a href={project.demo} target="_blank" rel="noreferrer">
                <img src={project.img} alt="project screenshot" />
              </a>
            </Col>
            <Col sm={12} md={6}>
              <div className="project-info px-3">
                <div className="mb-3 fw-bold">
                  <span>{project.type}</span>
                  <span className="dot"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="white" d="M12 10a2 2 0 0 0-2 2a2 2 0 0 0 2 2c1.11 0 2-.89 2-2a2 2 0 0 0-2-2Z" /></svg></span>
                  <span>{project.date}</span>
                </div>
                <p id="project-description">
                  {project.description}
                </p>
                {project.contributors && (
                  <div>
                    <span className="fw-bold">Collaborators: </span>
                    {project.contributors.map((contributor, index) => (
                      <a className="mx-1 text-info" href={contributor[1]} key={`c-${index + 1}`} target="_blank" rel="noreferrer">{contributor[0]}</a>
                    )) }
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div className="modal-tech-stack">
            {project.stack.map((stack, index) => (<span key={`stack ${index + 1}`}>{stack[0]}</span>))}
          </div>
          <div className="modal-actions">
            <a href={project.demo} target="_blank" rel="noreferrer">
              <span>See Live</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5m-6 0l7.5-7.5M15 3h6v6" /></svg>
            </a>
            <a href={project.source} target="_blank" rel="noreferrer">
              <span>See Source</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                <g fill="none">
                  <path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z" />
                  <path fill="white" d="M7.024 2.31a9.08 9.08 0 0 1 2.125 1.046A11.432 11.432 0 0 1 12 3c.993 0 1.951.124 2.849.355a9.08 9.08 0 0 1 2.124-1.045c.697-.237 1.69-.621 2.28.032c.4.444.5 1.188.571 1.756c.08.634.099 1.46-.111 2.28C20.516 7.415 21 8.652 21 10c0 2.042-1.106 3.815-2.743 5.043a9.456 9.456 0 0 1-2.59 1.356c.214.49.333 1.032.333 1.601v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.991c-.955.117-1.756.013-2.437-.276c-.712-.302-1.208-.77-1.581-1.218c-.354-.424-.74-1.38-1.298-1.566a1 1 0 0 1 .632-1.898c.666.222 1.1.702 1.397 1.088c.48.62.87 1.43 1.63 1.753c.313.133.772.22 1.49.122L8 17.98a3.986 3.986 0 0 1 .333-1.581a9.455 9.455 0 0 1-2.59-1.356C4.106 13.815 3 12.043 3 10c0-1.346.483-2.582 1.284-3.618c-.21-.82-.192-1.648-.112-2.283l.005-.038c.073-.582.158-1.267.566-1.719c.59-.653 1.584-.268 2.28-.031Z" />
                </g>
              </svg>
            </a>
          </div>
        </Modal.Footer>
      </>
      )}
    </Modal>
  );
};

export default ProjectModal;

ProjectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  project: PropTypes.instanceOf(Object).isRequired,
};
