const app = require("express")();
const fs = require("fs-extra");
const https = require("https");
const dataStore = require("nedb");

const PORT_NO = 1337;
const SECRETS_DIR = "./settings/secrets";
const STORAGE_DIR = "./storage";

const pushSubscriptionsDataStore = new dataStore({ filename: `${STORAGE_DIR}/pushSubscriptions.db`, autoload: true });

(async () => {
    const SSL_KEY = await fs.readFile(`${SECRETS_DIR}/localhost.key`);
    const SSL_CERT = await fs.readFile(`${SECRETS_DIR}/localhost.cer`);

    app.get("/", (_req, res) => {
        res.send("Hello World!");
    });

    https.createServer(
        {
            key: SSL_KEY,
            cert: SSL_CERT
        },
        app).listen(PORT_NO);
})();
