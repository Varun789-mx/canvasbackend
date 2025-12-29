import WebSocket from "ws";

const socket = new WebSocket('ws://localhost:8000');
socket.on('open', () => {
    console.log('connected to the server');
    socket.send('Hello from client to the server')
})
socket.on('message', (data: any) => {
    try {
        console.log('Received data:', data.toString());
    } catch (error) {
        console.log(data);
    }
})
socket.on('close', event => {
    console.error;
})

socket.on('error', event => {
    console.log('Error', event);
})


