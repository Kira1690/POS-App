#!/usr/bin/env node
/**
 * TCP Proxy: Forwards emulator traffic to TRX terminal on the LAN.
 *
 * Problem: Android emulator can't reach 192.168.1.12 directly (NoRouteToHostException).
 * Solution: Emulator connects to 10.0.2.2:1180 (host loopback) → this proxy → 192.168.1.12:1180
 *
 * Usage: bun run scripts/trx-tcp-proxy.js
 *   or:  node scripts/trx-tcp-proxy.js
 */
const net = require('net');

const TERMINAL_HOST = '192.168.1.12';
const TERMINAL_PORT = 1180;
const LISTEN_PORT = 1180;
const LISTEN_HOST = '0.0.0.0'; // Listen on all interfaces so 10.0.2.2 works

let connectionId = 0;

const server = net.createServer((clientSocket) => {
  const id = ++connectionId;
  const clientAddr = `${clientSocket.remoteAddress}:${clientSocket.remotePort}`;
  console.log(`[${id}] New connection from ${clientAddr}`);

  const targetSocket = net.connect(TERMINAL_PORT, TERMINAL_HOST, () => {
    console.log(`[${id}] Connected to terminal ${TERMINAL_HOST}:${TERMINAL_PORT}`);
  });

  // Pipe bidirectionally
  clientSocket.pipe(targetSocket);
  targetSocket.pipe(clientSocket);

  // Log data flow
  clientSocket.on('data', (data) => {
    console.log(`[${id}] App → Terminal: ${data.length} bytes`);
  });

  targetSocket.on('data', (data) => {
    console.log(`[${id}] Terminal → App: ${data.length} bytes`);
  });

  // Error handling
  clientSocket.on('error', (err) => {
    console.log(`[${id}] Client error: ${err.message}`);
    targetSocket.destroy();
  });

  targetSocket.on('error', (err) => {
    console.log(`[${id}] Terminal error: ${err.message}`);
    clientSocket.destroy();
  });

  // Close handling
  clientSocket.on('close', () => {
    console.log(`[${id}] Client disconnected`);
    targetSocket.destroy();
  });

  targetSocket.on('close', () => {
    console.log(`[${id}] Terminal disconnected`);
    clientSocket.destroy();
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${LISTEN_PORT} already in use. Kill existing process first.`);
  } else if (err.code === 'EACCES') {
    console.error(`Permission denied for port ${LISTEN_PORT}. Try a port > 1024.`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`TRX TCP Proxy started`);
  console.log(`  Listening on ${LISTEN_HOST}:${LISTEN_PORT}`);
  console.log(`  Forwarding to ${TERMINAL_HOST}:${TERMINAL_PORT}`);
  console.log(`  Emulator should connect to 10.0.2.2:${LISTEN_PORT}`);
  console.log(`  Press Ctrl+C to stop`);
});
