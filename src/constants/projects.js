import stack from './stack';
import conference from '../assets/images/projects/conference.png';
import leaderboard from '../assets/images/projects/leaderboard.jpg';
import chowtime from '../assets/images/projects/chowtime.jpg';
import spaceTravellers from '../assets/images/projects/space-travellers.jpg';
import awesomeBooks from '../assets/images/projects/awesome-books.png';
import metrics from '../assets/images/projects/metrics.jpg';
import viand from '../assets/images/projects/viand.jpg';
import lib from '../assets/images/projects/oop.png';
import project1 from '../assets/images/projects/project-img1.png';
import project2 from '../assets/images/projects/project-img2.png';
import project3 from '../assets/images/projects/project-img3.png';

const projects = {
  frontend: [
    {
      type: 'Frontend',
      date: '2023',
      title: 'Viand',
      summary: 'Resturant landing page',
      description: `
      Viand is a simple frontend project for a restaurant landing page built with React.js.
      I undertook this project not only because I enjoy fine dining from time to time, but also to follow coding best practices
      for folder and component structure, code splitting and Lazy Loading, as well as Type Checking.
      One thing I also enjoyed working on was the simple table booking form that pops up when a user clicks the booking button.
      A future features for this app will be to integrate backend logic for table reservations as well as adding a food menu.
      `,
      img: viand,
      stack: [['React', stack.react], ['JavaScript', stack.javaScript], ['Bootstrap', stack.bootstrap]],
      demo: 'https://viand.onrender.com',
      source: 'https://github.com/c00p75/Viand-Resturant',
    },
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
      date: '2023',
      title: 'Metrics Webapp',
      summary: 'Mobile web application to check a list of metrics',
      description: `
        This project focuses less on having a unique and creative design and more on meeting client design and functionality
        requirements. It is an API first mobile web app that fetches and displays country population data. The metrics can be filtered
        by continent to get country details. The feature I enjoyed implementing the most was the country search feature
        which filters the list of countries based in the search input.
      `,
      img: metrics,
      stack: [['JavaScript', stack.javaScript], ['React', stack.react], ['Redux', stack.redux], ['Bootstrap', stack.bootstrap]],
      demo: 'https://metrics-web-app.onrender.com',
      source: 'https://github.com/c00p75/Metrics-WebApp',
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
      title: 'ChowTime',
      summary: 'Food recipe application',
      description: `
        ChowTime is an API-first Vanilla JavaScript project that illustrates the consumption of APIs.
        In this project I use two sperate APIs. I use the MealDB API to fetch meal data and use
        a public API to store likes and comments associated with a particular meal.
        One of the challenges I had to overcome in this project was to handle loading many images
        in an efficient way. This was accomplished by lazy loading images and using a loading animation
        to improve user experience.
      `,
      img: chowtime,
      stack: [['Webpack', stack.webpack], ['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'http://georgemsapenda.me/Chow-Time/dist/',
      source: 'https://github.com/c00p75/Chow-Time',
    },
    {
      type: 'Frontend',
      date: '2022',
      title: 'Leaderboard',
      summary: 'Displays scores submitted by different players',
      description: `
        The leaderboard website displays scores submitted by different players and also allows
        scores to be submitted and preserved with the help of the external Leaderboard API service.
        This project was undertaken to get familiar with RESTful APIs as well as to attain a practical understanding
        of how to make API calls using appropriate headers, handle request responses and format data in the desired format.
        Before this project, an API sounded like a complex medical procedure. Now I know that it's simply
        an intermediary that allows two applications to share data.
      `,
      img: leaderboard,
      stack: [['Webpack', stack.webpack], ['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
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
  ],
  backend: [
    {
      type: 'Backend',
      date: '2023',
      title: 'School Library',
      summary: 'Library management tool',
      description: `
        This is a simple Ruby app undertaken to implement the four fundamental principles of Object Oriented Programming(OOP).
        It uses a basic UI and records what books are in a library and who borrows them.
        It allows the user to add new students or teachers, add new books, and saves records of who borrowed a given book and when.
        It's particularly valuable to me because it helped me gain a deeper understanding of Encapsulation, Abstraction,
        Inheritance, and Polymorphism. This understanding has allowed me to create solutions that are simpler to implement,
        understand, and maintain. Additionaly, the library data is stored as a json file, allowing me to implement my knowledge
        of writing and reading files using ruby.
      `,
      img: lib,
      stack: [['Ruby', stack.ruby], ['Rspec', stack.rspec]],
      contributors: [['@Amen-Musingarimi', 'https://github.com/Amen-Musingarimi']],
      demo: 'https://codesandbox.io/p/github/c00p75/oop-school-library/draft/sleepy-wind',
      source: 'https://github.com/c00p75/oop-school-library',
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
