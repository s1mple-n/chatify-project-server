const Conversation = require("../models/Conversation");
const Messages = require("../models/Messages");
var mongoose = require("mongoose");

require("dotenv").config();
module.exports.getAllConversation = async (req, res) => {
  try {
    const conversation = await Conversation.find({
      member: { $in: [req.userId] },
    })
      .sort({ updatedAt: -1 })
      .populate("member", "avatarURL username phoneNumber")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("createdBy", " _id username");
    res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.createConversation = async (req, res) => {
  const newConversation = new Conversation({
    label: req.body.label,
    member: req.body.member,
    createdBy: req.body.createdBy,
    isGroup: req.body.isGroup,
  });

  try {
    const savedConversation = await newConversation.save();
    const conversation = await Conversation.findById({
      _id: savedConversation._id,
    })
      .populate("member", "avatarURL username phoneNumber")
      // .populate("lastMessage", "text updatedAt")
      .populate("createdBy", " _id username");

    res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.changeLabel = async (req, res) => {
  const { newLabel, conversationId } = req.body;

  try {
    let conversation = await Conversation.findById(conversationId);
    if (conversation.label !== undefined) {
      conversation = await Conversation.findByIdAndUpdate(
        { _id: conversationId },
        {
          label: newLabel,
        },
        { new: true }
      )
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            model: "User",
            select: "username _id",
          },
        })
        .populate("member", "avatarURL username phoneNumber")
        .populate("createdBy", " _id username");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

module.exports.addMemberGroup = async (req, res) => {
  const { conversationId, newMember } = req.body;

  try {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { $push: { member: { $each: newMember } } },
      { new: true }
    )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("member", "avatarURL username phoneNumber")
      .populate("createdBy", " _id username");
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports.deleteGroup = async (req, res) => {
  const userId = req.userId;
  const { conversationId, deleteMemberId } = req.body;
  try {
    const conversation = await Conversation.findOneAndDelete({
      $and: [{ _id: conversationId }, { createdBy: userId }],
    })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("member", "avatarURL username phoneNumber")
      .populate("createdBy", " _id username");
    if (conversation) {
      await Conversation.findByIdAndDelete({ _id: conversationId });

      res.status(200).json(conversation);
    } else {
      res.status(500).json({ msg: "Chỉ có admin mới có quyền xóa nhóm chat" });
    }
  } catch (error) {
    res.status(500).json({ errorMessage: error });
  }
};
module.exports.deleteMember = async (req, res) => {
  const userId = req.userId;
  const { conversationId, deleteMemberId } = req.body;
  try {
    const conversation = await Conversation.findOneAndUpdate(
      {
        $and: [{ _id: conversationId }, { createdBy: userId }],
      },
      {
        $pull: { member: { $in: deleteMemberId } },
      },
      { new: true }
    )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("member", "avatarURL username phoneNumber")
      .populate("createdBy", " _id username");
    if (conversation) {
      res.status(200).json(conversation);
    } else {
      return res
        .status(500)
        .json({ msg: "Chỉ có admin mới có quyền xóa thành viên" });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: error });
  }
};

module.exports.outGroup = async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.userId;

  try {
    const conversation = await Conversation.findByIdAndUpdate(
      { _id: conversationId },
      {
        $pull: { member: userId },
      },
      { new: true }
    )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("member", "avatarURL username phoneNumber")
      .populate("createdBy", " _id username");
    res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ errorMessage: error });
  }
};

module.exports.updateCreator = async (req, res) => {
  const userId = req.userId;
  const { conversationId, newCreator } = req.body;
  try {
    const conversation = await Conversation.findOneAndUpdate(
      {
        $and: [{ _id: conversationId }, { createdBy: userId }],
      },
      { createdBy: newCreator },
      { new: true }
    )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          model: "User",
          select: "username _id",
        },
      })
      .populate("member", "avatarURL username phoneNumber")
      .populate("createdBy", " _id username");
    if (conversation) {
      res.status(200).json(conversation);
    } else {
      return res
        .status(500)
        .json({ msg: "Chỉ có admin mới có quyền xóa thành viên" });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: error });
  }
};

module.exports.getImageAndVideo = async (req, res) => {
  const { conversationId } = req.body;
  const media = await Messages.aggregate([
    {
      $match: {
        conversation: mongoose.Types.ObjectId(conversationId),
      },
    },
    { $match: { media: { $exists: true, $not: { $size: 0 } },isDelete:false } },
    { $project: { media: "$media" } },
    { $unwind: "$media" },
    {
      $match: {
        "media.type": { $in: [/^image/i, /^video/] },
      },
    },
  ]);

  try {
    res.status(200).json({ media });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports.getFileApplication = async (req, res) => {
  const { conversationId } = req.body;
  const file = await Messages.aggregate([
    {
      $match: {
        conversation: mongoose.Types.ObjectId(conversationId),
      },
    },
    { $match: { media: { $exists: true, $not: { $size: 0 } },isDelete:false } },
    { $project: { text:"$text",media: "$media" } },
    { $unwind: "$media" },
    {
      $match: {
        "media.type": { $in: [/^application/i] },
      },
    },
  ]);

  try {
    res.status(200).json({ file });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

module.exports.checkConversation = async (req, res) => {
  const { member } = req.body;
  try {
    const conversation = await Conversation.findOne({
      member: { $all: member },
      isGroup: false,
    });
    if (conversation) {
      res.status(200).json({ already: true });
    } else {
      res.status(200).json({ already: false });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};
