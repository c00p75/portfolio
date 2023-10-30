const projectCardObserver = (cards) => {
  const scale = new IntersectionObserver((cards) => {
    cards.forEach((card) => { card.target.classList.toggle('scale', card.isIntersecting); });
  }, { threshold: 0.8 });

  const summary = new IntersectionObserver((cards) => {
    cards.forEach((card) => { card.target.classList.toggle('show-summary', card.isIntersecting); });
  }, { threshold: 0.75 });

  cards.forEach((card) => {
    scale.observe(card);
    summary.observe(card);
  });
};

const visibilityObserver = (element, threshhold) => {
  const AppSectionObserver = new IntersectionObserver((element) => {
    element.forEach((e) => {
      e.target.classList.toggle('visible', e.isIntersecting);
      if (e.isIntersecting) AppSectionObserver.unobserve(e.target);
    });
  }, {
    threshold: threshhold,
  });

  element.forEach((e) => { AppSectionObserver.observe(e); });
};

const scaleObserver = (element, threshhold, unobserve) => {
  const scaleObserver = new IntersectionObserver((element) => {
    element.forEach((e) => {
      e.target.classList.toggle('scale', e.isIntersecting);
      if (unobserve && e.isIntersecting) scaleObserver.unobserve(e.target);
    });
  }, {
    threshold: threshhold,
  });

  element.forEach((e) => { scaleObserver.observe(e); });
};

const sectionObserver = (element) => {
  const AppSectionObserver = new IntersectionObserver((element) => {
    const navLinks = document.querySelectorAll('nav .nav-link');
    const removeActive = () => navLinks.forEach((link) => link.classList.remove('active'));
    const setActive = (index) => { removeActive(); navLinks[index].classList.add('active'); };
    element.reverse().forEach((e) => {
      if (e.target.id === 'current-section-home') { setActive(0); }
      if (e.target.id === 'current-section-skills') { setActive(1); }
      if (e.target.id === 'current-section-projects') { setActive(2); }
      if (e.target.id === 'current-section-about') { setActive(3); }
      if (e.target.id === 'current-section-connect') { setActive(4); }
      if (e.target.id === 'current-section-blog') { removeActive(); }
    });
  }, {
    threshold: 1,
  });

  element.forEach((e) => { AppSectionObserver.observe(e); });
};

export {
  projectCardObserver, visibilityObserver, scaleObserver, sectionObserver,
};
