import stack from './stack';
import conference from '../assets/images/projects/conference.png';
import leaderboard from '../assets/images/projects/leaderboard.jpg';
import spaceTravellers from '../assets/images/projects/space-travellers.jpg';
import awesomeBooks from '../assets/images/projects/awesome-books.png';
import project1 from '../assets/images/projects/project-img1.png';
import project2 from '../assets/images/projects/project-img2.png';
import project3 from '../assets/images/projects/project-img3.png';

const projects = {
  frontend: [
    {
      type: 'Frontend',
      date: '2022',
      title: 'Space Travellers Hub',
      summary: 'React-Redux app that works with real live data from the SpaceX API',
      description: `
        A Single Page Application (SPA) that works with real live data from the SpaceX API to display rockets, dragons and missions.
        It lets the user reserve rockets, book dragons and join mission. It also allows a user to view all
        reserved rockets, dragons, and space missions on the "My Profile" page.
        In this project, I used redux to manage application state and used React Router DOM for routes and navigation.
      `,
      img: spaceTravellers,
      stack: [['JavaScript', stack.javaScript], ['React', stack.react], ['Redux', stack.redux], ['Bootstrap', stack.bootstrap]],
      contributors: [['@haliljon', 'https://github.com/haliljon']],
      demo: 'https://space-x-travellers.onrender.com',
      source: 'https://github.com/c00p75/Space-Travelers',
    },
    {
      type: 'Frontend',
      date: '2022',
      title: 'Metrics Webapp',
      summary: 'Mobile web application to check a list of metrics',
      description: `
        This project focuses less on unique and creative design and more on meeting client design and functionality requirements.
        It is an API first app
        A Single Page Application (SPA) that works with real live data from the SpaceX API to display rockets, dragons and missions.
        It lets the user reserve rockets, book dragons and join mission. It also allows a user to view all
        reserved rockets, dragons, and space missions on the "My Profile" page.
        In this project, I used redux to manage application state and used React Router DOM for routes and navigation.
      `,
      img: spaceTravellers,
      stack: [['JavaScript', stack.javaScript], ['React', stack.react], ['Redux', stack.redux], ['Bootstrap', stack.bootstrap]],
      contributors: [['@haliljon', 'https://github.com/haliljon']],
      demo: 'https://space-x-travellers.onrender.com',
      source: 'https://github.com/c00p75/Space-Travelers',
    },
    {
      type: 'Frontend',
      date: '2022',
      title: 'Awesome Books',
      summary: 'Single Page Application written with plain JavaScript',
      description: `
        This is a basic website with minimal styling that allows users to add/remove books from a list.
        The main reason this project was undertaken was to understand how Single Page Applications(SPA) work.
        I used plain JavaScript to dynamically modify the DOM as responses to basic events.
        I also created JavaScript modules to keep my logic organized and stored the book inofrmation
        using JavaScript objects and arrays.
      `,
      img: awesomeBooks,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'http://georgemsapenda.me/Awesome-books-with-ES6',
      source: 'https://github.com/c00p75/Awesome-books-with-ES6',
    },
    {
      type: 'Frontend',
      date: '2022',
      title: 'Leaderboard',
      summary: 'The leaderboard website displays scores submitted by different players',
      description: `
        The leaderboard website displays scores submitted by different players and also allows
        scores to be submitted and preserved with the help of the external Leaderboard API service.
        This project was undertaken to get familiar with RESTful APIs as well as to attain a practical understanding
        of how to make API calls using appropriate headers, handle request responses and format data in the desired format.
        Before this project, an API sounded like a complex medical procedure. Now I know that it's simply
        an intermediary that allows two applications to share data.
      `,
      img: leaderboard,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'https://c00p75.github.io/Leaderboard/dist',
      source: 'https://github.com/c00p75/Leaderboard',
    },
    {
      type: 'Frontend',
      date: '2022',
      title: 'Pender Conference',
      summary: 'HTML, CSS conference site',
      description: `
        The goal of this project was to create an online informative website with personalized content while demonstrating
        the ability to create UIs adaptable to different screen sizes using media queries. It was also build using Bootstrap, a
        CSS library, and applying best practices in HTML, CSS and JavaScript code.
        In this project, I explored and applied media queries for the first time and learned different aspects of responsiveness.
        It also introduced me to reading documentation, as it was the first time I used Bootstrap.
      `,
      img: conference,
      stack: [['HTML', stack.html], ['CSS', stack.css], ['Bootstrap', stack.bootstrap]],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
  ],
  backend: [
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
  ],
  fullstack: [
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project1,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project2,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
    {
      type: 'Fullstack',
      date: '2022',
      title: 'Business Startup',
      summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
      description: `
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Some long description abouta dope project. Lorem ipsum dolor sit amet consectetur adipisicing elit.
      `,
      img: project3,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      contributors: [['John Doe', 'https://github.com/c00p75'], ['Jane Doe', 'https://github.com/c00p75']],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
  ],
};

export default projects;
