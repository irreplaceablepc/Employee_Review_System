// loads environment variables from a .env file into process.env
require('dotenv').config(".env");

// Importing required modules
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');

// Creating an instance of the Express application
const app = express();

// Connecting to the MongoDB database using Mongoose
const db = require('./config/mongoose');


// import the passport authentication library and the local strategy for passport 
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

const MongoStore = require('connect-mongo'); //storing user sessions in MongoDB
const customMware = require('./config/middleware'); // flash custom middleware

// BodyParser
app.use(bodyParser.urlencoded({ extended: false }));

// parsing cookies, 
app.use(cookieParser());

// rendering views with layout templates.
app.use(expressLayouts);

// set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// mongo store is used to store the session cookie in the db
app.use(
  session({
    name: 'employee-review-system',
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 2000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: process.env.db,
      autoRemove: 'disabled',
    }),
    function(err) {
      console.log(err || 'connect-mongodb setup ok');
    },
  })
);

// initialize passport and manage user sessions.
app.use(passport.initialize());
app.use(passport.session());

// sets the authenticated user in the response
app.use(passport.setAuthenticatedUser);

// flash and a custom middleware function to the application to display flash messages.
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/', require('./routes'));

// PORT Listen
app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`Server is running on port: ${process.env.PORT}`);
});
