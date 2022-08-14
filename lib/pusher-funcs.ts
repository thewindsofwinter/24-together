export function sendChat(username: string, color: string, msg: string) {
  let chatMsg = {
    tag: username + ":",
    color: color,
    message: msg,

  }
  console.log("CHAT MESSAGE: " + chatMsg.message);

  fetch("/api/pusher-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatMsg),
  });
}

export function sendUsernameChange(oldUsername: string, color: string, newUsername: string) {
  if (oldUsername == newUsername) {
    return;
  }
  let chatMsg = {
    tag: oldUsername,
    color: color,
    message: "set their username to \'" + newUsername + "\'",

  }
  console.log("CHAT MESSAGE: " + chatMsg.message);

  fetch("/api/pusher-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatMsg),
  });
}
