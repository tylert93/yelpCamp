const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware"),
      Campground = require("../models/campground"),
      Review = require("../models/review");

const calculateAverage = (reviews) => {
    if (reviews.length === 0) {
        return 0;
    }
    let sum = 0;
    reviews.forEach(function(item) {

        sum += Number(item.rating);
    });
    return sum / reviews.length;
}

// NEW
router.get("/campgrounds/:id/reviews/new", middleware.isLoggedIn, middleware.checkReviewDuplication, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("Campground not found")
            res.redirect("/error");
        } else {
            res.render("reviews/new", {campground:foundCampground});
        }
    });
});

// CREATE
router.post("/campgrounds/:id/reviews", middleware.isLoggedIn, middleware.checkReviewDuplication, (req, res) => {
    Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/error")
        } else {
            Review.create(req.body.review, (err, createdReview) => {
                if(err || !createdReview){
                    req.flash("error", "Review not created");
                    res.redirect("/error");
                } else {
                    createdReview.author.id = req.user._id;
                    createdReview.author.username = req.user.username;
                    createdReview.save();
                    foundCampground.reviews.push(createdReview);
                    foundCampground.rating = calculateAverage(foundCampground.reviews);
                    foundCampground.save();
                    req.flash("success", "Successfully added review")
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
});

// EDIT
router.get("/campgrounds/:id/reviews/:review_id/edit", middleware.isLoggedIn, middleware.checkReviewOwnership, (req, res) => {
    Review.findById(req.params.review_id, (err, foundReview) => {
        if(err || !foundReview){
            req.flash("error", "Review not found");
            res.redirect("error");
        } else {
            res.render("reviews/edit", {review:foundReview, campground_id:req.params.id});
        }
    });
});

// UPDATE
router.put("/campgrounds/:id/reviews/:review_id", middleware.isLoggedIn, middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, (err, updatedReview) => {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
                if(err){
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    foundCampground.rating = calculateAverage(foundCampground.reviews);
                    foundCampground.save();
                    req.flash("success", "Successfully updated review")
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
});

// DELETE
router.delete("/campgrounds/:id/reviews/:review_id", middleware.isLoggedIn, middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndDelete(req.params.review_id, (err, deletedReview) => {
        if(err || !deletedReview){
            req.flash("error", "Review not deleted");
            res.redirect("error");
        } else {
            Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((err, foundCampground) => {
                foundCampground.rating = calculateAverage(foundCampground.reviews);
                foundCampground.save();
                res.redirect("/campgrounds/" + req.params.id);
            });
            
        }
    });
});

module.exports = router;