import * as express from "express";
import * as fs from "fs-extra";
import * as https from "https";
import * as dataStore from "nedb";
import * as path from "path";
import * as webSocket from "ws";

const PORT_NO = 1337;
const SECRETS_DIR = "./settings/secrets";
const STORAGE_DIR = "./storage";
const STATIC_CONTENT_DIR = path.join(__dirname, "../../staticContent");
const DIST_DIR = path.join(__dirname, "../");

const app = express();
app.use(express.static(STATIC_CONTENT_DIR));
app.use(express.static(DIST_DIR));

const pushSubscriptionsDataStore = new dataStore({ filename: `${STORAGE_DIR}/pushSubscriptions.db`, autoload: true });

(async () => {
    const SSL_KEY = await fs.readFile(`${SECRETS_DIR}/localhost.key`);
    const SSL_CERT = await fs.readFile(`${SECRETS_DIR}/localhost.cer`);

    const server = https.createServer({ key: SSL_KEY, cert: SSL_CERT }, app);
    const wss = new webSocket.Server({ server });

    app.get("/", (_req, res) => {
        res.sendFile(path.join(__dirname, `${STATIC_CONTENT_DIR}/index.html`));
    });

    wss.on("connection", (ws) => {

        ws.on("message", (message) => {
            console.log(message);
            ws.send(`What did you just say to me?! "${message}" is offensive round these parts.`);
        });

        ws.send("Hello, web sockets rock!");
    });
    console.log(pushSubscriptionsDataStore.persistence);
    server.listen(PORT_NO);
})();
