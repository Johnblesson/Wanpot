import express from "express";
import cors from "cors";
import ejs from "ejs";
import dotenv from "dotenv";
import session from 'express-session';
import flash from 'connect-flash';
import path from "path"; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './server/database/connection.js';
import passport from './server/passport/passport-config.js';
import authRoutes from "./server/routes/auth.js";
import viewRoutes from "./server/routes/routes.js";
import fileConverterRoutes from "./server/routes/fileConverterRoutes.js";
import noteRoutes from "./server/routes/noteRoutes.js";
import expenseRoutes from "./server/routes/expenseRoutes.js";
import meetingRoutes from "./server/routes/meetingRoutes.js";
import taskRoutes from "./server/routes/taskRoutes.js";
import todoRoutes from "./server/routes/todoRoutes.js";
import searchHistoryRoutes from "./server/routes/searchRoutes.js";
import aiRoutes from './server/routes/aiRoutes.js';
import typistRoutes from "./server/routes/typistRoutes.js";
import aiCodeHelperRoutes from "./server/routes/aiCodeHelperRoutes.js";
import brainstormRoute from "./server/routes/brainstormRoutes.js"
import { checkSubscriptionStatus } from './server/middlewares/checkSubscription.js'
import http from "http";
import compression from "compression";
import { Server } from "socket.io";
import os from "os";

// Create an Express application
const app = express(); // Create an Express application
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Create Socket.io server
dotenv.config(); // Configure dotenv to use environment variables
connectDB(); // Connect to the database
// app.use(express.json()); // Parse JSON bodies
// Body parsers
app.use(express.json()); // for JSON requests
app.use(express.urlencoded({ extended: true })); // for form submissions

// OR (alternative if using body-parser package)
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser()); // Use cookie-parser
app.use(flash()); // Use connect-flash
app.use(cors()); // Use cors
app.set('trust proxy', true) // Trust proxy
app.use(compression()); // Use compression

// Set the view engine to ejs
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, './views');
app.set('view engine', 'ejs');
app.set('views', templatePath);

app.use('/uploads', express.static('uploads'));


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

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(authRoutes)
app.use("/", viewRoutes); // Use viewRoutes fileConverterRoutes
app.use(fileConverterRoutes);
app.use("/notes", noteRoutes);
app.use('/expense-tracker', expenseRoutes);
app.use('/meeting-scheduler', meetingRoutes);
app.use('/task-planner', taskRoutes);
app.use('/todo', todoRoutes);
app.use('/search', searchHistoryRoutes);
app.use('/ai', aiRoutes);
app.use("/api/typists", typistRoutes);
app.use(aiCodeHelperRoutes);
app.use('/ai/brainstorm', brainstormRoute)

app.use(checkSubscriptionStatus);


// Set up the server to listen on port 5000
const PORT = process.env.PORT;
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
