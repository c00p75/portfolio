const projectCardObserver = (cards) => {
  const scale = new IntersectionObserver((cards) => {
    cards.forEach((card) => { card.target.classList.toggle('scale', card.isIntersecting); });
  }, { threshold: 0.55 });

  const summary = new IntersectionObserver((cards) => {
    cards.forEach((card) => { card.target.classList.toggle('show-summary', card.isIntersecting); });
  }, { threshold: 0.9 });

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

export { projectCardObserver, visibilityObserver, scaleObserver };
