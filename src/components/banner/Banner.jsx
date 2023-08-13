import { useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ThemeContext } from '../ThemeContext';
import headerImg from '../../assets/images/astro4.png';
import astro from '../../assets/images/astronaut.png';
import './banner.css';

const description = ['Software Developer!', 'Web Designer!', 'Tech Fanatic!'];

const Banner = () => {
  const { darkMode } = useContext(ThemeContext);
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [typeSpeed, setTypeSpeed] = useState(200 - (Math.random() * 100));
  const interval = 2000;
  let ticker;

  const tick = () => {
    const i = loopNum % description.length;
    const fullText = description[i];
    const updatedText = isDeleting
      ? fullText.substring(0, text.length - 1)
      : fullText.substring(0, text.length + 1);
    setText(updatedText);
    if (isDeleting) {
      setTypeSpeed((prevTypeSpeed) => prevTypeSpeed / 2);
    }
    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setTypeSpeed(interval);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum((prevLoopNum) => prevLoopNum + 1);
      setTypeSpeed(350);
    }
  };

  useEffect(() => {
    ticker = setInterval(() => {
      tick();
    }, typeSpeed);

    return () => {
      clearInterval(ticker);
    };
  }, [text]);

  return (
    <section className="banner" id="home">
      <Container>
        <Row className="align-items-center justify-content-center">
          <Col xs={12} md={6} xl={7} className="mb-1">
            <h1>
              Hi. I&apos;m George, a
              {' '}
              <span>{text}</span>
              <span className="blinker" />
            </h1>
            <p>
              I can help you build or maintain your innovative web solutions.
              Look through some of my work and experience! If you like what you see
              don’t hestiate to contact me.
            </p>
            <a href="#connect">
              Let&apos;s Connect
              {' '}
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
                <g fill="none" stroke="white">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m12 15l3-3m0 0l-3-3m3 3H9" fill="white" />
                </g>
              </svg>
            </a>
          </Col>
          <Col xs={12} md={6} xl={5}>
            {darkMode && (<div className="grow"><img src={headerImg} alt="Header Img" className="header-img" loading="lazy" /></div>)}
            {!darkMode && (<div className="grow"><img src={astro} alt="Header Img" className="header-img" loading="lazy" /></div>)}
          </Col>
        </Row>
      </Container>
      {!darkMode && (<div className="light-bg-overlay" />)}
    </section>
  );
};

export default Banner;
