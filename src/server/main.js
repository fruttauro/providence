const dataStore = require("nedb");
const express = require("express");
const fs = require("fs-extra");
const https = require("https");
const path = require("path");
const webSocket = require("ws");

const PORT_NO = 1337;
const SECRETS_DIR = "./settings/secrets";
const STORAGE_DIR = "./storage";
const CLIENT_DIR = path.join(__dirname, "../client");

const app = express();
app.use(express.static(CLIENT_DIR));

const pushSubscriptionsDataStore = new dataStore({ filename: `${STORAGE_DIR}/pushSubscriptions.db`, autoload: true });

(async () => {
    const SSL_KEY = await fs.readFile(`${SECRETS_DIR}/localhost.key`);
    const SSL_CERT = await fs.readFile(`${SECRETS_DIR}/localhost.cer`);

    const server = https.createServer({ key: SSL_KEY, cert: SSL_CERT }, app);
    const wss = new webSocket.Server({ server });

    app.get("/", (_req, res) => {
        res.sendFile(path.join(__dirname, `${CLIENT_DIR}/index.html`));
    });

    wss.on("connection", (ws) => {

        ws.on("message", (message) => {
            console.log(message);
            ws.send(`What did you just say to me?! "${message}" is offensive round these parts.`)
        });

        ws.send("Hello, web sockets rock!");
    });

    server.listen(PORT_NO);
})(); 
