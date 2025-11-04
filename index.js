const express = require("express");
const fs = require("fs");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let loop = null;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);
  console.log("Bot is ready and connected!");

  app.post("/upload", (req, res) => {
    const text = req.body.text;
    fs.writeFileSync("reply.txt", text);

    res.send("Text uploaded and bot will auto send messages every 10s.");
    if (loop) clearInterval(loop);

    const replies = text.split("\n");
    let i = 0;

    loop = setInterval(() => {
      const msg = replies[i % replies.length];
      sock.sendMessage("91XXXXXXXXXX@s.whatsapp.net", { text: msg }); // put your number here
      i++;
    }, 10000);
  });
}

startBot();

app.listen(3000, () => console.log("Server running on port 3000"));
