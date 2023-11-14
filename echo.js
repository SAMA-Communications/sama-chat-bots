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
                  login: process.env.ECHO_LOGIN_KEY,
                  password: process.env.ECHO_PASSWORD_KEY,
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
          const { body, cid } = message.message;
          setTimeout(
            () =>
              this.socket.send(
                JSON.stringify({
                  message: {
                    id: this.botSession.user._id + Date.now(),
                    body,
                    cid,
                  },
                })
              ),
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

const echoBot = new EchoBot(process.env.APP_SOCKET_CONNECT);
echoBot.connect();
