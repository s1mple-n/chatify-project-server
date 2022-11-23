const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const db = require("./config/db");
const SocketServer = require("./SocketServer");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");
const conversationRoutes = require("./routes/conversations");
const s3 = require("./utils/s3")
const app = express();
require("dotenv").config();

db.connect();

app.use(cors({ origin: true, credentials: true,preflightContinue: false }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/s3Url", async (req, res) => {
  let url;
  try{
    url = await s3.generateUploadURL();
  } catch(err){
    res.status(500).send({error: `failed to get url: ${err}`});
    return;
  }
  res.status(200).json({ url });
});


const server = app.listen(process.env.PORT || 5000, () =>
  console.log("server runing on port 5000")
);
const io = socketio(server, {
  cors: {
    origin: "*",
    Credential: true,
  },
});

io.on("connection", (socket) => {
  SocketServer(socket,socket.handshake.query);
});
