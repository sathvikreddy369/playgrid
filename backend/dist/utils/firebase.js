"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
Object.defineProperty(exports, "getAuth", { enumerable: true, get: function () { return auth_1.getAuth; } });
try {
    if ((0, app_1.getApps)().length === 0) {
        (0, app_1.initializeApp)({
            projectId: process.env.FIREBASE_PROJECT_ID || 'sports-b5755',
        });
    }
    console.log('Firebase Admin SDK initialized successfully.');
}
catch (error) {
    console.error('Firebase Admin SDK initialization error (Auth will fail):', error.message);
}
exports.auth = (0, app_1.getApps)().length > 0 ? (0, auth_1.getAuth)() : null;
//# sourceMappingURL=firebase.js.map