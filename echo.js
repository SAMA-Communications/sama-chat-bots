import { WebSocket } from "ws";

class EchoBot {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.socket = null;
    this.botSession = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.baseUrl);

      this.socket.onopen = () => {
        console.log("[bot.socket.open]");

        try {
          this.socket.send(
            JSON.stringify({
              request: {
                user_login: {
                  login: process.env.BOT_LOGIN,
                  password: process.env.BOT_PASSWORD,
                  deviceId: "EchoBot_device",
                },
              },
            })
          );
        } catch (error) {
          console.log("[bot.socket.error]", error);
        }

        resolve();
      };

      this.socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        console.log("[bot.socket.message]", message);

        if (message.message) {
          const botId = this.botSession.user._id;
          const { _id, body, cid, attachments } = message.message;
          this.socket.send(
            JSON.stringify({
              request: {
                message_read: { cid },
                id: "echoBot:markConversationAsRead",
              },
            })
          );

          const messageToSend = {
            message: {
              id: botId + Date.now(),
              cid,
              body: body ? "Echo: " + body : "",
              attachments,
            },
          };

          setTimeout(
            () => this.socket.send(JSON.stringify(messageToSend)),
            3000
          );
          return;
        }

        if (message.response?.user) {
          this.botSession = message.response;
        }
      };

      this.socket.onerror = (error) => {
        console.log("[bot.socket.error]", error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log("[bot.socket.close]");
      };
    });
  }
}

const echoBot = new EchoBot(process.env.SERVER_ENDPOINT);
echoBot.connect();
