import { WebSocket } from "ws";

class EchoBot {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.socket = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.baseUrl);

      this.socket.onopen = () => {
        console.log("[bot.socket.open]");

        try {
        } catch (error) {
          console.log("[bot.socket.error]", error);
        }

        resolve();
      };

      this.socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        console.log("[bot.socket.message]", message);
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
