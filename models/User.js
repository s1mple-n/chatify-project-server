const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    isVerifyOtp:{type:Boolean,default:false},
    username: {type: String, required: true},
    password: {type: String, required: true},
    phoneNumber:{type:String,require:true},
    avatarURL:{type: String, required: true},
    friends: {type: [{ type: mongoose.Types.ObjectId, ref: "User" }],require:false,ref: "User"},
    nickname:{type: String, required: false},
    gender:{type:Boolean,require:true,default:true},
    friendsQueue: {type: [{ type: mongoose.Types.ObjectId, ref: "User" }],require:false,ref: "User"},
    SendRequestQueue: {type: [{ type: mongoose.Types.ObjectId, ref: "User" }],require:false,ref: "User"},
    dob:{type: String, required: false},
},{ timestamps: true })

module.exports = mongoose.model('User',UserSchema);