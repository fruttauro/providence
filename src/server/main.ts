import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as https from "https";
import * as path from "path";
import * as webPush from "web-push";
import * as webSocket from "ws";
import { sendResponse } from "./serverHelpers";
import { SettingsManager } from "./settingsManager";
import { PersistentStorageManager } from "./storageManager";

const PORT_NO = 1337;
const STATIC_CONTENT_DIR = path.join(__dirname, "../../staticContent");
const DIST_DIR = path.join(__dirname, "../");

const app = express();

// Preflight CORS for all routes
app.options("*", cors());

app.use(bodyParser.json());
app.use(express.static(STATIC_CONTENT_DIR));
app.use(express.static(DIST_DIR));

const storageManager = new PersistentStorageManager();
const settingsManager = new SettingsManager();

const pushSubscriptionsDataStore = storageManager.getPushSubscriptionDataStore();

(async () => {

    webPush.setVapidDetails(
        "mailto:danielfruttauro@driveworks.co.uk",
        settingsManager.getVapidPublicKey(),
        await settingsManager.getVapidPrivateKey());

    const server = https.createServer({
        key: await settingsManager.getSSLKey(),
        cert: await settingsManager.getSSLCert()
    },
        app);

    const wss = new webSocket.Server({ server });

    app.get("/", (_req, res) => {
        res.sendFile(path.join(__dirname, `${STATIC_CONTENT_DIR}/index.html`));
    });

    app.post("/api/pushSubscription", cors(), (req, res) => {
        const pushSubscriptionData = <PushSubscription>req.body;

        if (!pushSubscriptionData || !pushSubscriptionData.endpoint) {
            sendResponse(res, 400, "The push subscription request was invalid.", false);
        }

        pushSubscriptionsDataStore.insert(pushSubscriptionData, (error, _document) => {

            if (error) {
                if ((<any>error).errorType !== "uniqueViolated") {
                    sendResponse(res, 500, "The subscription was received but we were unable to save it to our database.", false);

                    return;
                }
            }

            sendResponse(res, 200, "The subscription was added to our database.");
        });
    });

    app.post("/gitWebhook", async (req, res) => {

        // TODO: How will we populate the client historically?
        // Will we cache historical data server side when we get it here?
        // Just cache client side?
        // Use the GitHub API to get some previous data on client load?

        for (const client of wss.clients) {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(req.body));
            }
        }

        if (await pushToAllSubscriptions(req.body.head_commit.message)) {
            sendResponse(res, 200, "Push notifications were sent to all subscriptions.");
        } else {
            sendResponse(res, 500, "Summut went wrong.", false);
        }
    });

    app.post("/api/triggerTestPost", cors(), async (_req, res) => {

        if (!await pushToAllSubscriptions("Hey, you!")) {
            sendResponse(res, 500, "Summut went wrong.", false);
        } else {
            sendResponse(res, 200, "Push notifications were sent to all subscriptions.");
        }
    });

    wss.on("connection", (ws) => {

        ws.on("message", (message) => {
            ws.send(JSON.stringify(`What did you just say to me?! "${message}" is offensive round these parts.`));
        });

        ws.send(JSON.stringify("Hello, web sockets rock!"));
    });

    server.listen(PORT_NO);
    console.log(`Big Brother Is Watching at Port ${PORT_NO}`);
})();

async function pushToAllSubscriptions(data: any) {
    pushSubscriptionsDataStore.find({}, async (error: Error, subscriptions: webPush.PushSubscription[]) => {

        if (error) {
            console.log(error);

            return false;
        }

        for (const subscription of subscriptions) {
            try {
                await webPush.sendNotification(subscription, JSON.stringify(data));
            } catch (error) {

                // Subscription is no longer valid
                if (error.statusCode === 410) {
                    pushSubscriptionsDataStore.remove(subscription);
                }

                console.log(error);
            }
        }

        return true;
    });

    return true;
}
