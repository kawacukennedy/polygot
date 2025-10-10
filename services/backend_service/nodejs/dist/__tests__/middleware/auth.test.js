"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../../middleware/auth");
describe('Auth Middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });
    describe('authenticate', () => {
        it('should call next() with valid token', () => {
            const token = jsonwebtoken_1.default.sign({ userId: '123', role: 'USER' }, process.env.JWT_SECRET || 'test-secret');
            mockRequest.headers = {
                authorization: `Bearer ${token}`,
            };
            (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toEqual({ userId: '123', role: 'USER' });
        });
        it('should return 401 with invalid token', () => {
            mockRequest.headers = {
                authorization: 'Bearer invalid-token',
            };
            (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
        });
        it('should return 401 with no token', () => {
            (0, auth_1.authenticate)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });
    });
    describe('requireAdmin', () => {
        it('should call next() for admin user', () => {
            mockRequest.user = { userId: '123', role: 'ADMIN' };
            (0, auth_1.requireAdmin)(mockRequest, mockResponse, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });
        it('should return 403 for non-admin user', () => {
            mockRequest.user = { userId: '123', role: 'USER' };
            (0, auth_1.requireAdmin)(mockRequest, mockResponse, nextFunction);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Admin access required' });
        });
    });
});
