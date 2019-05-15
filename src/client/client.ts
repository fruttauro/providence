const PUBLIC_PUSH_KEY = "BPfbkLtT8zRVfuLNsHXbCh89238qFJjZewmHsPCTDLhbRTFavy1naX00H74sc85yOK72WeTTHNxa78ZLYfHuEdM";
const API_BASE_URL = "https://ws-dev-danny:1337/api";

const socket = new WebSocket(`wss://ws-dev-danny:1337`);

socket.onerror = (error) => console.log(error);

socket.onopen = async () => {

    sendSocketStringMessage("Hey");

    const registration = await registerServiceWorker();

    if (registration !== null) {
        const pushPermission = await askPermission();

        if (pushPermission === "granted") {
            const subscription = await subscribeUserToPush(registration);
            postPushSubscription(subscription);
        }
    }
};

socket.onclose = () => console.log("Web sockets go bye bye.");
socket.onmessage = (message) => console.log(message);

function sendSocketStringMessage(message: string) {

    if (socket.readyState !== socket.OPEN) {
        console.log("Web Socket connection is not open. Message could not be sent.");

        return;
    }

    socket.send(message);
}

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("This browser does not support service workers and/or the Push API.");

        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register("client/serviceWorker.js");

        return registration;
    } catch (err) {

        console.error("Unable to register service worker.", err);
    }

    return null;
}

async function askPermission() {
    return Notification.requestPermission();
}

async function subscribeUserToPush(registration: ServiceWorkerRegistration) {

    const existingSubscription = await registration.pushManager.getSubscription();

    if (existingSubscription !== null) {
        return existingSubscription;
    }

    const subscriptionOptions: PushSubscriptionOptionsInit = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_PUSH_KEY)
    };

    return await registration.pushManager.subscribe(subscriptionOptions);
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function postPushSubscription(subscription: PushSubscription) {
    const response = await fetch(`${API_BASE_URL}/pushSubscription`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
    });

    if (!response.ok) {
        console.log("Server says no.");

        return {};
    }

    return response.json();
}
