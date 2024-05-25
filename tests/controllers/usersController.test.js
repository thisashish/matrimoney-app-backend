const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../../controllers/usersController');
const User = require('../../models/User');

const app = express();
app.use(bodyParser.json());

// Mock middleware
const authenticateUser = (req, res, next) => {
    req.userData = { userId: 'mockUserId' };
    next();
};

// Mock routes
app.post('/api/user/additional-info/:userId', authenticateUser, userController.enterAdditionalInfo);

// Mock the User model
jest.mock('../../models/User');

describe('User Controller - enterAdditionalInfo', () => {
    beforeEach(() => {
        User.findOne.mockClear();
    });

    it('should return 404 if user is not found', async () => {
        User.findOne.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/user/additional-info/mockUserId')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                gender: 'Male',
                dateOfBirth: '1990-01-01'
            });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'User not found' });
    });

    it('should update user info and return 200', async () => {
        const mockUser = {
            save: jest.fn().mockResolvedValue(true),
            firstName: 'John',
            lastName: 'Doe',
            gender: 'Male',
            dateOfBirth: '1990-01-01',
            age: 30
        };

        User.findOne.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/api/user/additional-info/mockUserId')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                gender: 'Female',
                dateOfBirth: '1992-02-02'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Additional information saved successfully' });
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.firstName).toBe('Jane');
        expect(mockUser.lastName).toBe('Doe');
        expect(mockUser.gender).toBe('Female');
        expect(mockUser.dateOfBirth).toBe('1992-02-02');
    });

    it('should handle errors and return 500', async () => {
        const errorMessage = 'Database error';
        User.findOne.mockRejectedValue(new Error(errorMessage));
    
        const response = await request(app)
            .post('/api/user/additional-info/mockUserId')
            .send({
                firstName: 'Jane',
                lastName: 'Doe',
                gender: 'Female',
                dateOfBirth: '1992-02-02'
            });
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to save additional information', error: errorMessage });
    });
    
});
