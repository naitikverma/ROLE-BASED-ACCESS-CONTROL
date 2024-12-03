const router = require('express').Router();
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

router.get('/login',ensureNOTAuthenticated,async(req,res,next)=>{
    res.render('login');
});

router.post('/login',ensureNOTAuthenticated,passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,

}));

router.get('/register',async(req,res,next)=>{
  
    res.render('register');
   
});


router.post('/register',[
  body('email').trim().isEmail().withMessage("Email must be valid").normalizeEmail().isLowercase(),
  body('password').trim().isLength(2).withMessage("Password min 2 char required"),
  body('password2').custom((value, {req} ) => {
    if(value !== req.body.password){
        throw new Error('Password do not match'); 
    }
    return true;
  })
],
async(req,res,next)=>{
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error =>{
            req.flash("error",error.msg)
        })
        res.render("register",{email:req.body.email, messages:req.flash()});
        return;
    }

        const { email } = req.body;
        const doesExist = await User.findOne({ email });
        if (doesExist){
            res.redirect('/auth/register');
            return;
        }

        const user =  new User(req.body);
        await user.save();
        req.flash('info',`${user.email} registered succesfully,you can now log in`)
        res.redirect('/auth/login');
    } catch (error) {
        next(error);
    }
    
});




router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err); // Handle error if logout fails
      }
      res.redirect('/'); // Redirect to home after successful logout
    });
  });
  function ensureNOTAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('back');
    } else {
      next();
    }
  }
 


module.exports = router;
