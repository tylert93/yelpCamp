import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import localStrategy from 'passport-local';
import expressSession from 'express-session';
import methodOveride from 'method-override';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import moment from 'moment';
import campgroundRoutes from './routes/campgrounds';
import reviewRoutes from './routes/reviews';
import indexRoutes from './routes/index';
import {User} from './models/user';

const app = express();

dotenv.config();      
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free"));
app.use(methodOveride("_method")),
app.use(flash());
app.locals.moment = moment;

mongoose.connect(process.env.DATABASE_URL, { 
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

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(campgroundRoutes);
app.use(reviewRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("server is running ...");
});