import mongoose from 'mongoose';

const campgroundSchema = mongoose.Schema({
    name:String,
    price:String,
    image:String,
    description:String,
    location:String,
    lat:Number,
    lng:Number,
    createdAt:{type:Date, default:Date.now},
    rating:{type:Number, default:0},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review"
    }]
});

export const Campground = mongoose.model("campground", campgroundSchema);