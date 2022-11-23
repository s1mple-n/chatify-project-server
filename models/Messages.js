const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    conversation: { type: mongoose.Types.ObjectId, ref: "Conversation" },
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    text: String,
    media:{ type: Array, require:false},
    type:{type:String,require:true},
    isDelete:{type:Boolean,require:true,default:false},
    call:Object
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
