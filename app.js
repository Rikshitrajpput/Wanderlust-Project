if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express= require('express');
const app= express();
const PORT = process.env.PORT || 8080;
const mongoose= require('mongoose');
const session= require('express-session');
const MongoStore= require('connect-mongo');
const flash= require('connect-flash');
const passport= require('passport');
const LocalStrategy= require('passport-local');
const User= require('./models/user.js');

const listingController = require("./controllers/listing.js");
const reviewController = require("./controllers/review.js");
const userController = require("./controllers/user.js");

const dbUrl=process.env.ATLASDB_URL;
// const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";

const methodOverride = require('method-override');
const path = require('path');
const wrapAsync =require("./utils/wrapAzync.js");
const ExpressError =require("./utils/ExpressError.js"); 
const { isLoggedIn,saveRedirectUrl,
        validateListing,isOwner ,
        isReviewAuthor,validateReview} = require("./middleware.js");
const { cloudinary,storage} = require('./cloudConfig.js');
const multer = require('multer');
const upload = multer({ storage: storage });       

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", require('ejs-mate'));

//session and flash
const store=MongoStore.createKrupteinAdapter({
  mongoUrl:dbUrl,
  touchAfter:24*60*60,
  crypto:{
    secret:"mysupersecretcode"
  }
});

const sessionOptions={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7
  }
};


app.use(session({
  store: store,
  ...sessionOptions
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currentUser=req.user;
  next();
});

  main()
  .then(()=> {
    console.log("Connected to MongoDB");
  })
  .catch((err)=> {
    console.log("Error connecting to MongoDB:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
};

// signup route
app.get("/signup",userController.renderSignupForm);
app.post("/signup", wrapAsync(userController.signup));

// login route
app.get('/login', userController.renderLoginForm);

app.post('/login',
  saveRedirectUrl,
   passport.authenticate('local',
     { failureRedirect: '/login', failureFlash: true }), 
     wrapAsync(userController.login));
 
// index route
app.get("/listings",wrapAsync(listingController.index));

//  createnew route
app.get("/listings/new", isLoggedIn, listingController.renderNewForm);

//new listing route
app.post("/listings",
  isLoggedIn,
    upload.single('listing[image]'),
  validateListing,
   wrapAsync( listingController.createNewListing));



// show route
app.get("/listings/:id",wrapAsync( listingController.showListing));

// render edit route
app.get("/listings/:id/edit",isLoggedIn,wrapAsync(listingController.renderEditForm));

// update route
app.put(
    "/listings/:id",
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
);

// delete route
app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// review route

//post review rote
app.post("/listings/:id/reviews", isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

// delete review route
app.delete(
    "/listings/:id/reviews/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview)
);

// logout route
app.get('/logout', wrapAsync(userController.logout));

app.get('/', (req, res)=> {
  res.send("Welcome to Wanderlust");
});

app.all("/{*splat}",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found"));
});
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;

    res.status(statusCode).send(message);
});
app.listen(PORT, ()=> {
  console.log(`Server is running on port ${PORT}`);
});