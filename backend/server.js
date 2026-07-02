const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');

// Route Imports
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = socketIo(server, {
  cors: {
    origin: '*', // Dynamic development reverse proxying
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log(`Socket.IO Client session connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket.IO Client session disconnected: ${socket.id}`);
  });
});

// Set io instance globally in Express app context
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Allows salting/saving base64 profile photo sizes
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Swagger UI Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes mounting
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Root route placeholder
app.get('/', (req, res) => {
  res.send('Student Management System API is running... View documentation at /api-docs');
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'API Endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Swagger Documentation portal active on http://localhost:${PORT}/api-docs`);
});
