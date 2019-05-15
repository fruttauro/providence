import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs-extra";
import * as https from "https";
import * as dataStore from "nedb";
import * as path from "path";
import * as webPush from "web-push";
import * as webSocket from "ws";

const PORT_NO = 1337;
const SECRETS_DIR = "./settings/secrets";
const STORAGE_DIR = "./storage";
const STATIC_CONTENT_DIR = path.join(__dirname, "../../staticContent");
const DIST_DIR = path.join(__dirname, "../");

const app = express();

// Preflight CORS for all routes
app.options("*", cors());

app.use(bodyParser.json());
app.use(express.static(STATIC_CONTENT_DIR));
app.use(express.static(DIST_DIR));

const pushSubscriptionsDataStore = new dataStore({ filename: `${STORAGE_DIR}/pushSubscriptions.db`, autoload: true });
pushSubscriptionsDataStore.ensureIndex({ fieldName: "endpoint", unique: true }, (error) => console.log(error));

(async () => {
    const SSL_KEY = await fs.readFile(`${SECRETS_DIR}/localhost.key`);
    const SSL_CERT = await fs.readFile(`${SECRETS_DIR}/localhost.cer`);

    const VAPID_KEYS = {
        publicKey: "BPfbkLtT8zRVfuLNsHXbCh89238qFJjZewmHsPCTDLhbRTFavy1naX00H74sc85yOK72WeTTHNxa78ZLYfHuEdM",
        privateKey: await fs.readFile(`${SECRETS_DIR}/pushPrivateKey`, "utf8")
    };

    webPush.setVapidDetails(
        "mailto:danielfruttauro@driveworks.co.uk",
        VAPID_KEYS.publicKey,
        VAPID_KEYS.privateKey);

    const server = https.createServer({ key: SSL_KEY, cert: SSL_CERT }, app);
    const wss = new webSocket.Server({ server });

    app.get("/", (_req, res) => {
        res.sendFile(path.join(__dirname, `${STATIC_CONTENT_DIR}/index.html`));
    });

    app.post("/api/pushSubscription", cors(), (req, res) => {
        const pushSubscriptionData = <PushSubscription>req.body;

        if (!pushSubscriptionData || !pushSubscriptionData.endpoint) {
            res.status(400);
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify({ data: { success: false, message: "The push subscription request was invalid. " } }));
        }

        pushSubscriptionsDataStore.insert(pushSubscriptionData, (error, _document) => {
            if (error) {

                // Thanks sucky typings
                if ((<any>error).errorType !== "uniqueViolated") {

                    res.status(500);
                    res.setHeader("Content-Type", "application/json");
                    res.send(JSON.stringify({
                        data: {
                            success: false,
                            message: "The subscription was received but we were unable to save it to our database."
                        }
                    }));

                    return;
                }
            }

            res.status(200);
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify({ data: { success: true, message: "The subscription was added to our database." } }));
        });
    });

    app.post("/api/triggerTestPost", cors(), async (_req, res) => {
        pushSubscriptionsDataStore.find({}, async (error: Error, subscriptions: any) => {
            if (error) {
                return;
            }

            for (const subscription of subscriptions) {
                console.log(subscription);
                await webPush.sendNotification(subscription, "Hello you!");
            }

        });

        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ data: { success: true, message: "Push notifications were sent to all subscriptions." } }));
    });

    wss.on("connection", (ws) => {

        ws.on("message", (message) => {
            ws.send(`What did you just say to me?! "${message}" is offensive round these parts.`);
        });

        ws.send("Hello, web sockets rock!");
    });

    server.listen(PORT_NO);
    console.log(`Big Brother Is Watching at Port ${PORT_NO}`);
})();
