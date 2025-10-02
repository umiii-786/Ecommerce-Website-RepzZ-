const mongoose=require('mongoose')
const reviewSchema=new mongoose.Schema({
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        reuqired:true
    },
    createdby:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    rating:{
       type:Number,
       min:0,
       max:5,
       required:true
    },
    description:{
        type:String,
        required:true
    }
})

const Review=mongoose.model('review',reviewSchema)
module.exports={
    Review
}