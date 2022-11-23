const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    member: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    label: {
      type: String,
    },
    lastMessage: { type: mongoose.Types.ObjectId, ref: "Messages",default:null },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    isGroup: {type:Boolean,require:true,default:false}
  },
  { timestamps: true }
);
ConversationSchema.index({
  name: "text",
  label: "text",
});
module.exports = mongoose.model("Conversation", ConversationSchema);

