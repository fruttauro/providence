(async () => {
    const socket = new WebSocket(`wss://localhost:1337`);

    socket.onerror = () => console.log(error);

    socket.onopen = () => socket.send("Hey");

    socket.onclose = () => console.log("Web sockets go bye bye.");

    socket.onmessage = (message) => console.log(message);
})();