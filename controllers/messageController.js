const Messages = require("../models/Messages");
require("dotenv").config();
const s3 = require("../utils/s3");
const crypto = require("crypto");
const { promisify } = require("util");
var mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
class APIfeatures {
  constructor(query, queryString){
      this.query = query;
      this.queryString = queryString;
  }

  paginating(){
      const page = this.queryString.page * 1 ||1
      const limit = this.queryString.limit * 1 || 15
      const skip = this.queryString.skip
      this.query = this.query.skip(skip).limit(limit)
      return this;
  }
}

module.exports.getMessageByConversationId = async (req, res, next) => {
  try {
    const { conversation } = req.body;
    const features = new APIfeatures(Messages.find({conversation: conversation}), req.body).paginating()
    const messages = await features.query
      .select("-updatedAt")
      .sort({ createdAt: -1 })
      .populate("sender", "_id username avatarURL");

    return res.json({ data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { sender, conversation, text, type, media,call } = req.body;
    const data = await Messages.create({
      conversation: conversation._id,
      sender: sender,
      text: text,
      type: type,
      media: media,
      call:call,
    }).then((data) => data.populate("sender", "_id avatarURL username"));
    await Conversation.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(conversation._id)},
      { lastMessage: data._id }
    )
    if (data) {
      return res.json({
        data: data,
      });
    }
    return res.status(200).json({ msg: "failed to add message " });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { conversation } = req.body;
    const messages = await Messages.find({
      conversation: conversation,
    })
      .select("-updatedAt")
      .sort({ createAt: 1 })
      .populate("sender", "_id username avatarURL");

    return res.json({ data: messages });
  } catch (error) {
    next(error);
  }
};

module.exports.uploadFile = async (req, res, next) => {
  try {
    const randomBytes = promisify(crypto.randomBytes);
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString("hex");
    const file = req.file
    const image = req.file.originalname.split('.')

    const fileType = image[image.length - 1]
    const code = await s3.generateUploadURL(file, imageName,fileType);
    
    return res.json({
      data: `https://${process.env.CLOUND_FRONT_URL}/${code}`,
    }); 
  } catch (error) {
    next(error);
  }
};


module.exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.body;
    const data = await Messages.findByIdAndUpdate({
      _id: mongoose.Types.ObjectId(id)
    },{isDelete:true},{new:true}).then((data) => data.populate("sender", "_id username avatarURL"));
    if (data) {
      return res.status(200).json({
        data: data});
    }
    return res.status(500).json({ msg: "failed to update message " });
  } catch (error) {
    next(error);
  }
};
