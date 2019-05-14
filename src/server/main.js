const app = require("express")();
const https = require("https");
const fs = require("fs-extra");

const PORT_NO = 1337;
const SECRETS_DIR = "./settings/secrets/";

(async () => {
    const SSL_KEY = await fs.readFile(`${SECRETS_DIR}localhost.key`);
    const SSL_CERT = await fs.readFile(`${SECRETS_DIR}localhost.cer`);

    app.get("/", (_req, res) => {
        res.send("Hello World!");
    });

    https.createServer({
        key: SSL_KEY,
        cert: SSL_CERT,
        passphrase: "Potatoes"
    }, app)
        .listen(PORT_NO);
})();
