var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Review = require("../models/review");

var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
        
var geocoder = NodeGeocoder(options);      

// INDEX
router.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            res.render("error", req.flash("error", err.message));
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

// CREATE
router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        Campground.create(req.body.campground, function(err, createdCampground){
            if(err){
                req.flash("error", "Campground not created")
                res.redirect("back");
            } else {
                createdCampground.author.id = req.user._id;
                createdCampground.author.username = req.user.username;
                createdCampground.location = location;
                createdCampground.lat = lat;
                createdCampground.lng = lng;
                createdCampground.save();
                req.flash("success", "Successfully created campground")
                res.redirect("/campgrounds");
            }
        });
    });    
});

// NEW
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW
router.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate("reviews").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", err.message);
            console.log(err);
            res.redirect("/error");
        } else {
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

// EDIT
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found")
            res.redirect("/error");
        } else {
            res.render("campgrounds/edit", {campground:foundCampground});
        }
    });
});

// UPDATE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err || !updatedCampground){
                req.flash("error", "Campground not found")
                res.redirect("/error");
            } else {
                req.flash("Successfully updated campground")
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    });    
});

// DELETE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndDelete(req.params.id, function(err, deletedCampground){
        if(err || !deletedCampground){
            req.flash("error", "Campground could not be deleted");
            res.redirect("/error");
        }
        Review.deleteMany( {_id: { $in: deletedCampground.reviews } }, function(err){
            if(err){
                req.flash("error", err.message);
                res.redirect("/error");
            }
            res.redirect("/campgrounds");
        });
    });
});

module.exports = router;