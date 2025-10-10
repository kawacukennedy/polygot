"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const snippet_1 = __importDefault(require("./routes/snippet"));
const comment_1 = __importDefault(require("./routes/comment"));
const search_1 = __importDefault(require("./routes/search"));
const gdpr_1 = __importDefault(require("./routes/gdpr"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const notification_1 = __importDefault(require("./routes/notification"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        // Add profiling integration
        (0, profiling_node_1.nodeProfilingIntegration)(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});
const app = (0, express_1.default)();
// The request handler must be the first middleware on the app
app.use(Sentry.expressIntegration());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.tracingHandler());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// Routes
app.use('/auth', auth_1.default);
app.use('/users', user_1.default);
app.use('/snippets', snippet_1.default);
app.use('/comments', comment_1.default);
app.use('/search', search_1.default);
app.use('/gdpr', gdpr_1.default);
app.use('/leaderboard', leaderboard_1.default);
app.use('/notifications', notification_1.default);
app.use('/admin', admin_1.default);
// Serve static files (avatars)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});
// Socket.io for real-time updates
io.on('connection', (socket) => {
    logger_1.default.info({ socketId: socket.id }, 'User connected');
    // Join leaderboard room for real-time updates
    socket.on('join-leaderboard', () => {
        socket.join('leaderboard');
        logger_1.default.info({ socketId: socket.id }, 'User joined leaderboard room');
    });
    // Leave leaderboard room
    socket.on('leave-leaderboard', () => {
        socket.leave('leaderboard');
        logger_1.default.info({ socketId: socket.id }, 'User left leaderboard room');
    });
    socket.on('disconnect', () => {
        logger_1.default.info({ socketId: socket.id }, 'User disconnected');
    });
});
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.expressErrorHandler());
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    logger_1.default.info({ port: PORT }, 'Server running');
});
