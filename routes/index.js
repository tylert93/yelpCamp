const express = require("express"),
      app = express(),
      router = express.Router(),
      passport = require("passport"),
      User = require("../models/user");   

// LANDING
router.get("/", (req, res) => {
    res.render("landing");
})

// REGISTER
router.get("/register", (req, res) => {
    res.render("register");
})

router.post("/register", (req, res) => {
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
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect:"/login_success",
        failureRedirect:"/login",
        failureFlash:true
    }), (req, res) => {
});

router.get("/login_success", (req, res) => {
    if(req.isAuthenticated()){
        req.flash("success", "Logged in as " + req.user.username);
        res.redirect("/campgrounds");
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
})

// LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/campgrounds");
});

// ERROR
router.get("/error", (req, res) => {
    res.render("error");
})

router.get("*", (req, res) => {
    res.render("error");
})

module.exports = router;