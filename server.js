import express from "express";
import cors from "cors";
import ejs from "ejs";
import path from "path"; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import viewRoutes from "./server/routes/routes.js";
import http from "http";
import compression from "compression";
import { Server } from "socket.io";
import os from "os";

// Create an Express application
const app = express(); // Create an Express application
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Create Socket.io server

// app.use(express.json()); // Parse JSON bodies
// app.use(cookieParser()); // Use cookie-parser
// app.use(flash()); // Use connect-flash
app.use(cors()); // Use cors
app.set('trust proxy', true) // Trust proxy
app.use(compression()); // Use compression

// Set the view engine to ejs
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, './views');
app.set('view engine', 'ejs');
app.set('views', templatePath);

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use("/assets", express.static(path.join(__dirname, "public/assets"), {
  maxAge: '30d', // Cache assets for 30 days
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// Handle favicon requests
app.get('/favicon.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.svg'));
});


// Routes
app.use("/", viewRoutes); // Use viewRoutes

// Set up the server to listen on port 8080
const PORT = 8080;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// For development only
const networkInterfaces = os.networkInterfaces(); // Get network interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Available on:`);
  Object.keys(networkInterfaces).forEach((iface) => {
    networkInterfaces[iface].forEach((alias) => {
      if (alias.family === 'IPv4') {
        console.log(`  http://${alias.address}:${PORT}`);
      }
    });
  });
});

export { io }; // Export io to use in other files
