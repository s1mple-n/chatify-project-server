const {
  getAllConversation,
  createConversation,
  changeLabel,
  addMemberGroup,
  deleteGroup,
  deleteMember,
  outGroup,
  updateCreator,
  getImageAndVideo,
  checkConversation
} = require("../controllers/conversationController");
const { auth } = require("../middleware/auth");

const router = require("express").Router();

router.post("/getAllConversations", auth, getAllConversation);
router.post("/createConversation", auth, createConversation);
router.post("/changeLabel", auth, changeLabel);
router.post("/addMemberGroup", auth, addMemberGroup);
router.post("/deleteGroup", auth, deleteGroup);
router.post("/deleteMember", auth, deleteMember);
router.post("/outGroup", auth, outGroup);
router.post("/updateCreator", auth, updateCreator);
router.post("/getImageAndVideo",auth, getImageAndVideo);
router.post("/checkConversation",auth, checkConversation);


module.exports = router;
