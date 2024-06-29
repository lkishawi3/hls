const net = require('net');

const PROXY_PORT = 1936;
const RTMP_SERVER_PORT = 1935;

const server = net.createServer((clientSocket) => {
    console.log('New connection');

    const serverSocket = net.connect(RTMP_SERVER_PORT, 'localhost', () => {
        console.log('Connected to RTMP server');
    });

    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);

    clientSocket.on('error', (err) => {
        console.log('Client socket error:', err);
    });

    serverSocket.on('error', (err) => {
        console.log('Server socket error:', err);
    });

    clientSocket.on('close', () => {
        console.log('Client connection closed');
        serverSocket.end();
    });

    serverSocket.on('close', () => {
        console.log('Server connection closed');
        clientSocket.end();
    });
    });

    server.listen(PROXY_PORT, () => {
    console.log(`TCP proxy listening on port ${PROXY_PORT}`);
    });

    server.on('error', (err) => {
    console.log('Server error:', err);
    });