import express from 'express';
import passport from 'passport';
import {User} from '../models/user';   

const indexRoutes = express.Router();

// LANDING
indexRoutes.get("/", (req, res) => {
    res.render("landing");
})

// REGISTER
indexRoutes.get("/register", (req, res) => {
    res.render("register");
})

indexRoutes.post("/register", (req, res) => {
    const newUser = new User({username:req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// LOGIN
indexRoutes.get("/login", (req, res) => {
    res.render("login");
});

indexRoutes.post("/login", passport.authenticate("local",
    {
        successRedirect:"/login_success",
        failureRedirect:"/login",
        failureFlash:true
    }), (req, res) => {
});

indexRoutes.get("/login_success", (req, res) => {
    if(req.isAuthenticated()){
        req.flash("success", "Logged in as " + req.user.username);
        res.redirect("/campgrounds");
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
})

// LOGOUT
indexRoutes.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/campgrounds");
});

// ERROR
indexRoutes.get("/error", (req, res) => {
    res.render("error");
});

indexRoutes.get("*", (req, res) => {
    res.render("error");
});

export default indexRoutes