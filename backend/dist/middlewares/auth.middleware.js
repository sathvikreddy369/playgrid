"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuth = exports.requireAuth = exports.requireFirebaseUser = void 0;
const firebase_1 = require("../utils/firebase");
const db_1 = __importDefault(require("../utils/db"));
const requireFirebaseUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!firebase_1.auth) {
            res.status(500).json({ error: 'Firebase Auth is not initialized properly on the server' });
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        req.firebaseUid = decodedToken.uid;
        next();
    }
    catch (error) {
        console.error('Firebase Auth Error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        return;
    }
};
exports.requireFirebaseUser = requireFirebaseUser;
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!firebase_1.auth) {
            res.status(500).json({ error: 'Firebase Auth is not initialized properly on the server' });
            return;
        }
        // Verify token
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        req.firebaseUid = decodedToken.uid;
        // Fetch user from DB and attach to req
        const user = await db_1.default.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });
        if (user) {
            if (user.isBlocked) {
                res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
                return;
            }
            req.user = user;
            next();
        }
        else {
            res.status(401).json({ error: 'Unauthorized: User not synced to database yet' });
            return;
        }
    }
    catch (error) {
        console.error('Authentication Error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        return;
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        if (!firebase_1.auth) {
            next();
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        req.firebaseUid = decodedToken.uid;
        const user = await db_1.default.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });
        if (user && !user.isBlocked) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Silently continue if token is invalid for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: User not found in database' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
