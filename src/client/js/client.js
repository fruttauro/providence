const socket = new WebSocket(`wss://localhost:1337`);

socket.onerror = () => console.log(error);
socket.onopen = () => sendSocketMessage("Hey");
socket.onclose = () => console.log("Web sockets go bye bye.");
socket.onmessage = (message) => console.log(message);

function sendSocketMessage(message) {

    if (socket.readyState !== socket.OPEN) {
        console.log("Web Socket connection is not open. Message could not be sent.");

        return;
    }

    socket.send(message);
}