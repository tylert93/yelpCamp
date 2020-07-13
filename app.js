require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Review = require("./models/review"),
    User = require("./models/user"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    expressSession = require("express-session"),
    campgroundRoutes = require("./routes/campgrounds"),
    reviewRoutes = require("./routes/reviews"),
    indexRoutes = require("./routes/index"),
    methodOveride = require("method-override"),
    flash = require("connect-flash"),
    moment = require("moment");  

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free"));
app.use(methodOveride("_method")),
app.use(flash());
app.locals.moment = moment;

// mongoose.connect("mongodb://localhost/yelp_camp_3", { 
//     useUnifiedTopology: true, 
//     useNewUrlParser: true, 
//     useFindAndModify:false 
// });

mongoose.connect("mongodb+srv://tom-tyler:bongo33@cluster0.8znkx.mongodb.net/yelp_camp_deployed?retryWrites=true&w=majority", { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify:false 
});

// PASSPORT CONFIGURATION
app.use(expressSession({
    secret:"tortoise green october",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(campgroundRoutes);
app.use(reviewRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running ...");
});