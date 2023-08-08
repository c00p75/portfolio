import './contact.css';
import { useState, useEffect, useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm, ValidationError } from '@formspree/react';
import contactImg from '../../assets/images/astro2.png';
import contactImg2 from '../../assets/images/astro3.png';
import { scaleObserver } from '../../constants/observer';
import { ThemeContext } from '../ThemeContext';

const Contact = () => {
  const { darkMode } = useContext(ThemeContext);

  const initialFormDetails = {
    firstName: '',
    lasstName: '',
    email: '',
    message: '',
  };

  const [formDetails, setFormDetails] = useState(initialFormDetails);
  const [status, handleSubmit] = useForm('mbjbpwzk'); // xjvqvzol
  const [buttonText, setButtonText] = useState('Send');

  const onFormUpdate = (category, value) => {
    setFormDetails({
      ...formDetails,
      [category]: value,
    });
  };

  const onFormSubmit = async (e) => {
    try {
      await handleSubmit(e);
      if (status.succeeded) {
        setFormDetails(initialFormDetails);
      }
    } catch (error) {
      setButtonText('Try again'); // Add Toast Notification
    }
  };

  useEffect(() => {
    const contactImgScale = document.querySelectorAll('#connect .img-container');
    scaleObserver(contactImgScale, 0, true);
  });

  return (
    <section id="connect">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="img-container">
            {darkMode && (<div className="grow"><img src={contactImg} alt="Contact me" /></div>)}
            {!darkMode && (<div className="grow"><img src={contactImg2} alt="Contact me" /></div>)}
          </Col>
          <Col md={6}>
            <h2>Get In Touch</h2>
            <form onSubmit={(e) => { onFormSubmit(e); }}>
              <Row>
                <Col sm={12} lg={6} className="px-1">
                  <input type="text" name="firstName" value={formDetails.firstName} placeholder="First Name" onChange={(e) => onFormUpdate('firstName', e.target.value)} required />
                  <ValidationError field="firstName" prefix="First Name" errors={status.errors} />
                </Col>
                <Col sm={12} lg={6} className="px-1">
                  <input type="text" name="lastName" value={formDetails.lastName} placeholder="Last Name" onChange={(e) => onFormUpdate('lastName', e.target.value)} required />
                  <ValidationError field="lastName" prefix="Last Name" errors={status.errors} />
                </Col>
                <Col sm={12} className="px-1">
                  <input type="email" name="email" value={formDetails.email} placeholder="Email" onChange={(e) => onFormUpdate('email', e.target.value)} required />
                  <ValidationError field="email" prefix="Email" errors={status.errors} />
                </Col>
                <Col sm={12} className="px-1">
                  <textarea rows="6" name="message" value={formDetails.message} placeholder="Message" onChange={(e) => onFormUpdate('message', e.target.value)} required />
                  <button type="submit" disabled={status.submitting} className="d-flex align-items-center justify-content-center">

                    {status.submitting && (
                    <div className="d-flex">
                      <span>Sending</span>
                      <div className="loader">
                        <li className="ball" />
                        <li className="ball" />
                        <li className="ball" />
                      </div>
                    </div>
                    )}
                    {(!status.succeeded && !status.submitting) && (<span>{buttonText}</span>)}
                    {status.succeeded && (
                      <div className="sent-btn">
                        <span>Sent</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L6.75 9.19L5.53 7.97a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l4.5-4.5Z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </button>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Contact;
