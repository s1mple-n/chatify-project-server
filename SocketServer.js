let users = [];

const SocketServer = (socket, query) => {
  console.log("new connection");

  const HasUser = users.find((user1) => user1.id === query._id);
  if (HasUser) {
    users.map((user1) => {
      if (user1.id === query._id) {
        user1.socketId = socket.id;
      }
    });
  } else {
    users.push({
      id: query._id,
      socketId: socket.id,
      friends: query.friends.split(","),
      // username: query.username,
      // avatarURL: query.avatarURL,
    });
  }

  socket.on("checkUserOnline", (data) => {
    let friends = users.filter((user) =>
      data.friends.find((item) => item._id === user.id)
    );
    friends = friends.map((friend) => friend.id);

    socket.emit("checkUserOnlineToMe", friends);
  });

  let friends2 = users.filter((user) =>
    query.friends.split(",").find((item) => item === user.id)
  );

  console.log("here",friends2);

  if (friends2.length > 0) {
    friends2.forEach((client) => {
      socket
        .to(`${client.socketId}`)
        .emit("checkUserOnlineToClient", query._id);
    });
  }


  socket.on("disconnect", () => {
    console.log("disconnect");
    const offUser = users.find((user) => user.socketId == socket.id);

    if (offUser) {
      const friends = offUser.friends.map((item) =>
        users.find((user) => user.id === item)
      );
      console.log("here", offUser);
      if (friends.length > 0) {
        friends.forEach((client) => {
          if (client) {
            socket.to(`${client.socketId}`).emit("CheckUserOffline", offUser);
          }
        });
      }
    }
    if (offUser?.call) {
      const callUser = users.find((user) => user.id === offUser.call);
      if (callUser) {
        users = EditData(users, callUser.id, null);
        socket.to(`${callUser.socketId}`).emit("callerDisconnect");
      }
    }

    console.log(socket.id);
    users = users.filter((user) => user.socketId !== socket.id);
  });

  // Call User
  const EditData = (data, id, call) => {
    const newData = data.map((item) =>
      item.id === id ? { ...item, call } : item
    );
    return newData;
  };
  // Call User
  socket.on("callUser", (data) => {
    users = EditData(users, data.sender, data.recipient);

    const client = users.find((user) => user.id === data.recipient);
    console.log(data);
    if (client) {
      if (client.call) {
        socket.emit("userBusy", data);
        users = EditData(users, data.sender, null);
      } else {
        users = EditData(users, data.recipient, data.sender);
        socket.to(`${client.socketId}`).emit("callUserToClient", data);
      }
    }
  });

  socket.on("endCall", (data) => {
    const client = users.find((user) => user.id === data.sender);

    if (client) {
      socket.to(`${client.socketId}`).emit("endCallToClient", data);
      users = EditData(users, client.id, null);

      if (client.call) {
        const clientCall = users.find((user) => user.id === client.call);
        clientCall &&
          socket.to(`${clientCall.socketId}`).emit("endCallToClient", data);

        users = EditData(users, client.call, null);
      }
    }
  });
  socket.on("send-msg", async (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.sender._id
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user && socket.to(user.socketId).emit("msg-receive", data2);
    });
  });

  socket.on("delete-msg", async (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.sender._id
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user && socket.to(user.socketId).emit("delete-receive", data2);
    });
  });

  socket.on("addConversation", (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.conversation.createdBy._id
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("addConversation-receive", data2.conversation);
    });
  });

  socket.on("changeGroupName", (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.userChange
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("changeGroupName-receive", data2.conversation);
    });
  });

  socket.on("addMemberToGroup", (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.userChange
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("addMemberToGroup-receive", data2.conversation);
    });
  });

  socket.on("deleteMemberGroup", (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.conversation.createdBy._id
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("deleteMemberGroup-receive", data2.conversation);
    });
    const deleteUser = users.find((user1) => user1.id === data2.deleteUser);
    deleteUser &&
      socket
        .to(deleteUser.socketId)
        .emit("deleteMemberGroup-receive", data2.conversation);
    deleteUser &&
      socket
        .to(deleteUser.socketId)
        .emit("deleteMemberGroup-receiveMobile", deleteUser);
  });

  socket.on("changeCreatorGroup", (data) => {
    const data2 = JSON.parse(data);
    const UserRemain = data2.conversation.member.filter(
      (user) => user._id !== data2.oldCreator
    );
    UserRemain.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("changeCreatorGroup-receive", data2.conversation);
    });
  });
  socket.on("outGroup", (data) => {
    const data2 = JSON.parse(data);

    data2.conversation.member.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket.to(user.socketId).emit("outGroup-receive", data2.conversation);
    });
  });
  socket.on("deleteGroup", (data) => {
    const data2 = JSON.parse(data);
    data2.conversation.member.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket
          .to(user.socketId)
          .emit("deleteGroup-receive", data2.conversation);
    });
  });

  socket.on("requestAddFriend", (data) => {
    const data2 = JSON.parse(data);
    const client = users.find((user) => user.id === data2.recipient);
    if (client) {
      socket
        .to(`${client.socketId}`)
        .emit("requestAddFriendToClient", data2.sender);
    }
  });
  socket.on("onTypingText", (data) => {
    const data2 = JSON.parse(data);
    data2.member.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket.to(`${user.socketId}`).emit("onTypingTextToClient", {
          conversationId: data2.conversationId,
          sender: data2.sender,
          isTyping: true,
        });
    });
    return;
  });
  socket.on("offTypingText", (data) => {
    const data2 = JSON.parse(data);
    data2.member.forEach((element, index) => {
      const user = users.find((user1) => user1.id === element._id);
      user &&
        socket.to(`${user.socketId}`).emit("offTypingTextToClient", {
          conversationId: data2.conversationId,
          sender: data2.sender,
          isTyping: false,
        });
    });
    return;
  });
  socket.on("acceptAddFriend", (data) => {
    const data2 = JSON.parse(data);
    const client = users.find((user) => user.id === data2.recipient);
    if (client) {
      socket.to(`${client.socketId}`).emit("acceptAddFriendToClient", data2);
    }
  });
  socket.on("recallFriend", (data) => {
    const data2 = JSON.parse(data);
    const client = users.find((user) => user.id === data2.recipient);
    if (client) {
      socket
        .to(`${client.socketId}`)
        .emit("recallFriendToClient", data2.sender);
    }
  });

  socket.on("deleteFriend", (data) => {
    const data2 = JSON.parse(data);
    const client = users.find((user) => user.id === data2.recipient);
    if (client) {
      socket
        .to(`${client.socketId}`)
        .emit("deleteFriendToClient", data2.sender);
    }
  });
};

module.exports = SocketServer;
