self.addEventListener("push", (event) => {
    const title = "Providence";
    const options = {
        icon: "https://images-na.ssl-images-amazon.com/images/I/51CnHZpSOaL._SY355_.jpg",
        body: (<PushEvent>event).data.text()
    };
    self.registration.showNotification(title, options);
});
