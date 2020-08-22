import express from 'express';
import NodeGeocoder from 'node-geocoder';
import {isLoggedIn, checkCampgroundOwnership} from '../middleware/index';
import {Campground} from '../models/campground';
import {Review} from '../models/review';
    

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
        
const geocoder = NodeGeocoder(options),     
      campgroundRoutes = express.Router();

// INDEX
campgroundRoutes.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            res.render("error", req.flash("error", err.message));
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

// CREATE
campgroundRoutes.post("/campgrounds", isLoggedIn, (req, res) => {
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        let lat = data[0].latitude,
            lng = data[0].longitude,
            location = data[0].formattedAddress;
        Campground.create(req.body.campground, (err, createdCampground) => {
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
campgroundRoutes.get("/campgrounds/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW
campgroundRoutes.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
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
campgroundRoutes.get("/campgrounds/:id/edit", checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found")
            res.redirect("/error");
        } else {
            res.render("campgrounds/edit", {campground:foundCampground});
        }
    });
});

// UPDATE
campgroundRoutes.put("/campgrounds/:id", checkCampgroundOwnership, (req, res) => {
    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
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
campgroundRoutes.delete("/campgrounds/:id", checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, (err, deletedCampground) => {
        if(err || !deletedCampground){
            req.flash("error", "Campground could not be deleted");
            res.redirect("/error");
        }
        Review.deleteMany( {_id: { $in: deletedCampground.reviews } }, (err) => {
            if(err){
                req.flash("error", err.message);
                res.redirect("/error");
            }
            res.redirect("/campgrounds");
        });
    });
});

export default campgroundRoutes;