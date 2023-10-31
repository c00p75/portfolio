import { stack } from './stack';
import conference from '/public/images/projects/conference-sm.png';
import conferenceGif from '/public/images/projects/conference.png';
import leaderboard from '/public/images/projects/leaderboard-sm.jpg';
import leaderboardGif from '/public/images/projects/leaderboard.jpg';
import chowtime from '/public/images/projects/chowtime-sm.jpg';
import chowtimeGif from '/public/images/projects/chowtime.gif';
import spaceTravellers from '/public/images/projects/space-travellers-sm.jpg';
import spaceTravellersGif from '/public/images/projects/space-travellers.jpg';
import awesomeBooks from '/public/images/projects/awesome-books.png';
import awesomeBooksGif from '/public/images/projects/awesome-books.gif';
import metrics from '/public/images/projects/metrics.jpg';
import metricsGif from '/public/images/projects/metrics.gif';
import viand from '/public/images/projects/viand-sm.jpg';
import viandGif from '/public/images/projects/viand.gif';
import lib from '/public/images/projects/oop.jpg';
import catalogOfMyThings from '/public/images/projects/catalog-of-my-things.jpg';
import blog from '/public/images/projects/blog-app-sm.jpg';
import blogGif from '/public/images/projects/blog-app.gif';
import cycleCruise from '/public/images/projects/cyclecruise-sm.jpg';
import cycleCruiseGif from '/public/images/projects/cyclecruise.jpg';
import futureEd from '/public/images/projects/future-ed.jpg';
import futureEdGif from '/public/images/projects/future-ed.gif';

const projects = {
  frontend: [
    {
      organization: 'Microverse',
      type: 'Frontend',
      date: '2023',
      title: 'Viand',
      summary: 'Resturant landing page with reservation form',
      description: `
      Viand is a simple frontend project for a restaurant landing page built with React.js.
      I undertook this project not only because I enjoy fine dining from time to time, but also to follow coding best practices
      for folder and component structure, code splitting and Lazy Loading, as well as Type Checking.
      One thing I also enjoyed working on was the simple table booking form that pops up when a user clicks the booking button.
      A future features for this app will be to integrate backend logic for table reservations as well as adding a food menu.
      `,
      img: viand,
      gif: viandGif,
      stack: [['React', stack.react], ['JavaScript', stack.javaScript], ['Bootstrap', stack.bootstrap]],
      demo: 'https://viand.onrender.com',
      source: 'https://github.com/c00p75/Viand-Resturant',
    },
    {
      organization: 'Microverse',
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
      gif: spaceTravellersGif,
      stack: [['JavaScript', stack.javaScript], ['React', stack.react], ['Redux', stack.redux], ['Bootstrap', stack.bootstrap]],
      contributors: [['@haliljon', 'https://github.com/haliljon']],
      demo: 'https://space-x-travellers.onrender.com',
      source: 'https://github.com/c00p75/Space-Travelers',
    },
    {
      organization: 'Microverse',
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
      gif: metricsGif,
      stack: [['JavaScript', stack.javaScript], ['React', stack.react], ['Redux', stack.redux], ['Bootstrap', stack.bootstrap]],
      demo: 'https://metrics-web-app.onrender.com',
      source: 'https://github.com/c00p75/Metrics-WebApp',
    },
    {
      organization: 'Microverse',
      type: 'Frontend',
      date: '2022',
      title: 'Awesome Books',
      summary: 'Single Page Application written with plain JavaScript',
      description: `
        This is a basic website with minimal styling that allows users to add/remove books from a list.
        The main reason this project was undertaken was to understand how Single Page Applications(SPA) work.
        I used plain JavaScript to dynamically modify the DOM as responses to basic events.
        I also created JavaScript modules to keep my logic organized as well as stored and retrieved the book
        information from local storage as JavaScript objects and arrays.
      `,
      img: awesomeBooks,
      gif: awesomeBooksGif,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'https://c00p75.github.io/Awesome-books-with-ES6',
      source: 'https://github.com/c00p75/Awesome-books-with-ES6',
    },
    {
      organization: 'Microverse',
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
      gif: chowtimeGif,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'https://c00p75.github.io/ChowTime/dist/',
      source: 'https://github.com/c00p75/ChowTime',
    },
    {
      organization: 'Microverse',
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
      gif: leaderboardGif,
      stack: [['JavaScript', stack.javaScript], ['HTML', stack.html], ['CSS', stack.css]],
      demo: 'https://c00p75.github.io/Leaderboard/dist',
      source: 'https://github.com/c00p75/Leaderboard',
    },
    {
      organization: 'Microverse',
      type: 'Frontend',
      date: '2022',
      title: 'Penda Conference',
      summary: 'HTML, CSS conference site',
      description: `
        The goal of this project was to create an online informative website with personalized content while demonstrating
        the ability to create UIs adaptable to different screen sizes using media queries. It was also build using Bootstrap, a
        CSS library, and applying best practices in HTML, CSS and JavaScript code.
        In this project, I explored and applied media queries for the first time and learned different aspects of responsiveness.
        It also introduced me to reading documentation, as it was the first time I used Bootstrap.
      `,
      img: conference,
      gif: conferenceGif,
      stack: [['HTML', stack.html], ['CSS', stack.css], ['Bootstrap', stack.bootstrap]],
      demo: 'https://c00p75.github.io/Capstone-project-Conference-page/home.html',
      source: 'https://github.com/c00p75/Capstone-project-Conference-page',
    },
  ],
  backend: [
    {
      organization: 'Microverse',
      type: 'Backend',
      date: '2023',
      title: 'Blog App',
      summary: 'Rails CRUD app',
      description: `
        This Ruby on Rails app focuses on implementing the Model View Controller (MVC) architecture and performing
        Create, Read, Update, and Delete (CRUD) operations while adhering to an entity relationship diagram (ERD).
        It showcases adeptness with Rails conventions as well as Rails' Object-Relational Mapping (ORM) framework,
        Active Record. The application is also secure app from n+1 problems and provides API routes accompanied by API documentaion.
        Additional standout features include Model validations to ensure that all data input is validated
        prior to database interaction, email-password authentication with the Devise gem, and unit testing with RSpec.
      `,
      img: blog,
      gif: blogGif,
      stack: [['Ruby on Rails', stack.ror], ['Ruby', stack.ruby], ['PostreSQL', stack.postgresql], ['Rspec', stack.rspec]],
      source: 'https://github.com/c00p75/oop-school-library',
    },
    {
      organization: 'Microverse',
      type: 'Backend',
      date: '2023',
      title: 'Catalog of My Things',
      summary: 'Collection management tool',
      description: `
        This is a straightforward Ruby console application that enables users to efficiently manage collections of their possessions.
        The application adheres to a Unified Modeling Language (UML) class diagram, employing relationships analogous to the
        structure of an SQL schema. Its primary focus lies in implementing various types of associations, such as many-to-many
        relationships, and aggregations that represent parent-child relationships between classes. This collaborative endeavor
        involved a team of three, with my primary contribution centered around the book class and its associations with other classes.
        Throughout the project, we adhered to the four principles of Object-Oriented Programming (OOP).
      `,
      img: catalogOfMyThings,
      stack: [['Ruby', stack.ruby], ['Rspec', stack.rspec], ['SQL', stack.sql]],
      contributors: [['@zeff96, ', 'https://github.com/zeff96'], ['@Tafloninno', 'https://github.com/Tafloninno']],
      demo: 'https://codesandbox.io/p/github/zeff96/catalog_of_my_things/draft/hungry-saha',
      source: 'https://github.com/zeff96/catalog_of_my_things/tree/draft/hungry-saha',
    },
    {
      organization: 'Microverse',
      type: 'Backend',
      date: '2023',
      title: 'School Library',
      summary: 'Library management tool',
      description: `
      This is a simple Ruby console application that follows a Unified Modeling Language (UML) class diagram to create simple
      associations between classes. It utilizes a basic UI to track books within a library, including information about borrowers
      and due dates. The project was undertaken to implement the four fundamental principles of Object-Oriented Programming (OOP)
      and allowed me to deepen my understanding of Encapsulation, Abstraction, Inheritance, and Polymorphism. Additionally,
      the library data is read from and written to a JSON file using Ruby.
      `,
      img: lib,
      // gif: libGif,
      stack: [['Ruby', stack.ruby], ['Rspec', stack.rspec]],
      contributors: [['@Amen-Musingarimi', 'https://github.com/Amen-Musingarimi']],
      demo: 'https://codesandbox.io/p/github/c00p75/oop-school-library/draft/sleepy-wind',
      source: 'https://github.com/c00p75/oop-school-library',
    },
  ],
  fullstack: [
    {
      organization: 'Microverse',
      type: 'Fullstack',
      date: '2023',
      title: 'Cycle Cruise',
      summary: 'Motorcycle booking platform',
      description: `
      A full-stack app for booking motorcycles. Key features of the app include authenticated users being able to
      add and delete a motorcycle, as well as view a list of motorcycles and navigate to their details page.
      Users can also reserve a motorcycle for a specific date and city, and view a list of their reservations.
      Apart from the technical accomplishments, this collaborative project was undertaken by a group of 4 aiming
      to work effectively together to deliver a digital product. My contribution to the project focused on the app's layout,
      the reservations page, and the entity models. Some challenges we overcame while working as a group included unexpected
      issues causing delays, conflicts within the team, and difficult decisions to be made regarding features and trade-offs.
      `,
      img: cycleCruise,
      gif: cycleCruiseGif,
      stack: [['Ruby on Rails', stack.ror], ['PostgreSQL', stack.postgresql], ['React', stack.react], ['Redux', stack.redux], ['Rspec', stack.rspec], ['Bootstrap', stack.bootstrap]],
      contributors: [['@maov19,', 'https://github.com/maov19'], ['@adamilare,', 'https://github.com/adamilare'], ['@veronica365', 'https://github.com/veronica365']],
      demo: 'https://cycle-cruise.onrender.com/',
      source: 'https://github.com/c00p75/appointment-app-frontend',
    },
    {
      organization: 'Personal Project',
      type: 'Fullstack',
      date: '2023',
      title: 'FutureEd Foundation',
      summary: 'Payment process simulation',
      description: `
      This project for a non-profit organization offers donors a seamless payment process while dynamically presenting an
      amount in their local currency. The project includes features such as an input field for users to specify the payment amount in USD
      and integration with an external API to convert the entered USD amount into the user's local currency based on their selected
      country from a dropdown menu. Additionally, the project incorporates payment gateway integrations for both PayPal and
      Sparcopay to facilitate debit card and mobile money transactions securely. To ensure an optimal user experience, the project
      prioritizes responsiveness and an appealing visual design.
      `,
      img: futureEd,
      gif: futureEdGif,
      stack: [['Node', stack.nodejs], ['TypeScript', stack.typeScript], ['React', stack.react], ['Jest', stack.jest]],
      demo: 'https://future-ed.onrender.com/',
      source: 'https://github.com/c00p75/takehome-payment-gateway',
    },
  ],
};

export default projects;
