var express = require("express"),
    app = express(),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user");   

// LANDING
router.get("/", function(req, res){
    res.render("landing");
})

// REGISTER
router.get("/register", function(req, res){
    res.render("register");
})

router.post("/register", function(req, res){
    const newUser = new User({username:req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// LOGIN
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect:"/login_success",
        failureRedirect:"/login",
        failureFlash:true
    }), function(req, res){
});

router.get("/login_success", function(req, res){
    if(req.isAuthenticated()){
        req.flash("success", "Logged in as " + req.user.username);
        res.redirect("/campgrounds");
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
})

// LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/campgrounds");
});

// ERROR
router.get("/error", function(req, res){
    res.render("error");
})

router.get("*", function(req, res){
    res.render("error");
})

module.exports = router;