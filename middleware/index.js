const middlewareObj = {},
      Campground = require("../models/campground"),
      Review = require("../models/review");

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login"); 
}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that - back");
                    return res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
        req.redirect("/login");
    }
}

middlewareObj.checkReviewOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, (err, foundReview) => {
            if(err || !foundReview){
                req.flash("error", "Review not found")
                res.redirect("back");
            } else {
                if(foundReview.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that");
        res.redirect("/login");
    }
}

middlewareObj.checkReviewDuplication = (req, res, next) => {
    Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground) => {
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("error");
        } else {
            let isOwned = false;
            foundCampground.reviews.forEach((item) => {
                if(item.author.id.equals(res.locals.currentUser.id)){
                    isOwned = true;
                }
            });
            if(isOwned){
                req.flash("error", "You can only leave one review per campground");
                res.redirect("/campgrounds/" + req.params.id);
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    req.flash("error", "You cannot leave a review for your own campground");
                    res.redirect("/campgrounds/" + req.params.id);
                } else {
                    next(); 
                }
                
            }
        }
    });
}

module.exports = middlewareObj;