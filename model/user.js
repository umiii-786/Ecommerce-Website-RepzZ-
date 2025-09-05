const { required } = require('joi')
const mongoose = require('mongoose')

const user_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true,
    },
    Role:{
        type:String,
        enum:['Admin','User'],
        required:true
    },
    orders:{
        type:[mongoose.Schema.ObjectId],
        ref:'Order'
    }
})

const User=mongoose.model('User',user_schema)

module.exports={
    User
}
