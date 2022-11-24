const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

require("dotenv").config();

module.exports.signin = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber }).populate(
      "friends friendsQueue SendRequestQueue",
      "username avatarURL phoneNumber _id"
    );

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Số điện thoại chưa được đăng ký", errorCode: 1 });
    }

    const isCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isCorrect) {
      return res.status(400).json({ message: "Sai mật khẩu", errorCode: 2 });
    }

    const token = jwt.sign(
      { phoneNumber: existingUser.phoneNumber, id: existingUser._id },
      "test",
      { expiresIn: "5h" }
    );

    res.status(200).json({ user: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.signup = async (req, res) => {
  const { password, username, phoneNumber, dob, gender } = req.body;
  const avatarURL = ""
  try {
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Số điện thoại này đã được đăng ký" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      password: hashedPassword,
      username,
      phoneNumber,
      avatarURL,
      dob,
      gender,
    });

    const token = jwt.sign(
      { phoneNumber: user.phoneNumber, id: user._id },
      "test",
      {
        expiresIn: "5h",
      }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.checkOTP = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber });

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Số điện thoại chưa được đăng ký", errorCode: 1 });
    }

    const isCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isCorrect) {
      return res.status(400).json({ message: "Sai mật khẩu", errorCode: 2 });
    }

    res.status(200).json({
      user: { phoneNumber, password, isVerifyOtp: existingUser.isVerifyOtp },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.changeVerifyOTP = async (req, res) => {
  const userId = req.userId;
  const {isVerifyOtp} = req.body
  try {
    const existingUser = 
    await User.findOneAndUpdate(
      { _id: userId },
      {
        isVerifyOtp : isVerifyOtp
      },{new:true}
    );

    res.status(200).json({
      user: { existingUser },
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.updatePhonenumber = async (req, res) => {
  const { phoneNumber } = req.body;
  const userId = req.userId;
  try {
    const existingUser = await User.findOneAndUpdate(
      { _id: userId },
      { phoneNumber: phoneNumber }, { new: true }
    ).populate(
      "friends friendsQueue SendRequestQueue",
      "username avatarURL phoneNumber _id"
    );

    res.status(200).json({
      existingUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.updatePassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.userId;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const existingUser = await User.findOneAndUpdate(
      { _id: userId }, { password: hashedPassword }, { new: true }
    ).populate(
      "friends friendsQueue SendRequestQueue",
      "username avatarURL phoneNumber _id"
    );

    res.status(200).json({
      existingUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  try {
    await User.findOneAndUpdate(
      { phoneNumber },
      {
        password: hashedPassword,
      }
    );

    res.status(200).json({
      message: "Lấy lại mật khẩu thành công",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports.checkPhonenumber = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(200).json({ isExist: true });
    }
    return res.status(200).json({ isExist: false });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};
