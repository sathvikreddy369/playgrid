"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const fs_1 = __importDefault(require("fs"));
const serviceAccountPath = '/Users/sathvikreddy/Documents/gemini/sports-b5755-firebase-adminsdk-fbsvc-7121a451a0.json';
try {
    if (!(0, app_1.getApps)().length) {
        if (fs_1.default.existsSync(serviceAccountPath)) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(require(serviceAccountPath))
            });
        }
        else {
            console.warn('Firebase service account not found, using default env credentials');
            (0, app_1.initializeApp)();
        }
        console.log('Firebase Admin initialized.');
    }
}
catch (error) {
    console.error('Firebase Admin initialization error', error);
}
exports.auth = (0, auth_1.getAuth)();
