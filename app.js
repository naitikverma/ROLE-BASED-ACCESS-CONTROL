const express = require('express') ;
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const { Cookie } = require('express-session');
const passport = require('passport');




const app = express();
//initi session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  Cookie :{
    //secure: true
    httponly: true
  }
})
);

// for pass port
app.use(passport.initialize());
app.use(passport.session());
require('./utills/passport.auth');

app.use((req,res,next)=>{
  res.locals.user = req.user;
  next();
})



app.use(connectFlash());
app.use((req,res,next)=>{
  res.locals.messages = req.flash();
  next();
})
//initialize


app.use(morgan('dev'));
app.set ('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routers
app.use('/',require('./routes/index.route'));
app.use('/auth',require('./routes/auth.route'));
app.use('/user',ensureAuthenticated,require('./routes/user.route'));

app.use('/admin',ensureAuthenticated,require/*,ensureadminAuthenticated*/('./routes/admin.route'))

app.use((req,res,next)=>{
    next(createHttpError.NotFound());
})

app.use((error,req,res,next)=>{
    error.status = error.status || 500;
    res.status(error.status);
    res.render('error_40x',{error});
});

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/mydb')
  .then(() => {
    console.log('💾Connected to MongoDB');
    app.listen(PORT, () =>console.log(`🚀 on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


  function ensureAuthenticated(req, res, next) {
       if (req.isAuthenticated()) {
         next();
       } else {
         res.redirect('/auth/login');
       }
     }
  
    /* function ensureadminAuthenticated(req, res, next) {
      if (req.user.role === roles.admin) {
        next();
      } else {
        res.flash('warning','you are not admin');
        res.redirect('/');
      }
    }
   */

    function ensureAdmin(req, res, next) {
      if (req.isAuthenticated() && req.user.role === roles.admin) {
        return next(); // User is an admin, proceed to the next middleware or route handler
      }
      req.flash('error', 'You are not authorized to perform this action.');
      return res.redirect('/auth/login'); // Redirect to login or any other appropriate page
    }