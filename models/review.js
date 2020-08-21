const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    text:String,
    createdAt:{type:Date, default:Date.now},
    rating:{type:Number, default:0},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }
});

module.exports = mongoose.model("Review", reviewSchema);