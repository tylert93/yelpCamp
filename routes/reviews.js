import express from 'express';
import {isLoggedIn, checkReviewOwnership, checkReviewDuplication} from '../middleware/index';
import {Campground} from '../models/campground';
import {Review} from '../models/review';

const reviewRoutes = express.Router();

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
reviewRoutes.get("/campgrounds/:id/reviews/new", isLoggedIn, checkReviewDuplication, (req, res) => {
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
reviewRoutes.post("/campgrounds/:id/reviews", isLoggedIn, checkReviewDuplication, (req, res) => {
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
reviewRoutes.get("/campgrounds/:id/reviews/:review_id/edit", isLoggedIn, checkReviewOwnership, (req, res) => {
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
reviewRoutes.put("/campgrounds/:id/reviews/:review_id", isLoggedIn, checkReviewOwnership, (req, res) => {
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
reviewRoutes.delete("/campgrounds/:id/reviews/:review_id", isLoggedIn, checkReviewOwnership, (req, res) => {
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

export default reviewRoutes;