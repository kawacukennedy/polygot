"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSnippet = exports.validateSignup = exports.sanitizeInput = void 0;
const express_validator_1 = require("express-validator");
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
// Create a DOMPurify instance
const window = new jsdom_1.JSDOM('').window;
const DOMPurifyInstance = (0, dompurify_1.default)(window);
// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Sanitize string fields in body
    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = DOMPurifyInstance.sanitize(obj[key]);
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };
    if (req.body) {
        sanitizeObject(req.body);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Validation middleware
exports.validateSignup = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 20 })
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('Username must be 3-20 alphanumeric characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 12 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must be at least 12 characters with upper, lower, number, and special character'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validateSnippet = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be 1-100 characters'),
    (0, express_validator_1.body)('code')
        .isLength({ min: 1, max: 10000 })
        .withMessage('Code must be 1-10000 characters'),
    (0, express_validator_1.body)('language')
        .isIn(['PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP', 'GO', 'RUST', 'RUBY', 'PHP'])
        .withMessage('Invalid language'),
    (0, express_validator_1.body)('visibility')
        .optional()
        .isIn(['PUBLIC', 'PRIVATE'])
        .withMessage('Visibility must be PUBLIC or PRIVATE'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];
// CSRF protection will be added to main app
