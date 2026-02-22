import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  // WebSocket Server for Real-time Collaboration
  const wss = new WebSocketServer({ server });

  const clients = new Map<WebSocket, { id: string; color: string; name: string }>();

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substr(2, 9);
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    const name = `User ${Math.floor(Math.random() * 1000)}`;
    
    clients.set(ws, { id, color, name });

    // Send initial state or welcome message
    ws.send(JSON.stringify({ type: 'init', id, color, name }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast to all other clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              ...data,
              userId: id,
              userColor: color,
              userName: name
            }));
          }
        });
      } catch (e) {
        console.error('Error parsing message', e);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      // Broadcast disconnect
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'user_disconnect', userId: id }));
        }
      });
    });
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production (if needed, though this is dev env)
    app.use(express.static('dist'));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
