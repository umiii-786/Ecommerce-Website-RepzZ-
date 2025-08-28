
const mongoose=require('mongoose')


const message_schema=new mongoose.Schema({
    sender:{
        type:String,
        enum:['user','admin']
    },
     message:{
        type:String,
        required:true
     },
     time:{
        type:Date,
        default:Date.now()
     },
     status:{
        type:String,
        enum:['read','unread'],
        required:true
     }
},{_id:false})
const chat_schema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    messages:{
        type:[message_schema]
    }
})

const Chat=new mongoose.model('chat',chat_schema)
module.exports={
    Chat
}

