const ICON_URL = "https://images-na.ssl-images-amazon.com/images/I/51CnHZpSOaL._SY355_.jpg";
const NOTIFICATION_TITLE = "Providence";

self.addEventListener("push", (event) => {
    console.log(event);
    self.registration.showNotification(NOTIFICATION_TITLE, {
        icon: ICON_URL,
        body: (<PushEvent>event).data.json(),
        actions: [
            {
                action: "yes-action",
                title: "Keep Watching",
                icon: "https://cdn3.iconfinder.com/data/icons/flat-actions-icons-9/512/Tick_Mark-512.png"
            },
            {
                action: "no-action",
                title: "Leave Me Alone",
                icon: "https://png.pngtree.com/svg/20161106/ee8df8289e.png"
            }
        ]
    });
});

self.addEventListener("notificationclick", (event) => {

    const notificationEvent = <NotificationEvent>event;

    if (!notificationEvent.action || notificationEvent.action === "yes-action") {
        notificationEvent.notification.close();

        return;
    }

    self.registration.showNotification(NOTIFICATION_TITLE, {
        body: "WRONG ANSWER.\nYou will get it right next time.\nOr else.",
        icon: ICON_URL
    });

    notificationEvent.notification.close();
});
