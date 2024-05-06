// router.post('/super-admin/login', authController.superAdminLogin);
// router.post('/super-admin/add-admin', authenticateSuperAdmin, authController.addAdmin);


const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isAdmin = require('../middleware/isAdmin');
const { validationResult } = require('express-validator');
const { superAdminLogout } = require('../controllers/authController');
const authenticateSuperAdmin = require('../middleware/adminLogout');
const authenticateAdmin = require('../middleware/adminAuth');


const adminsController = require('../controllers/adminsController');


// Admin login route
router.post('/super-admin-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const tokenPayload = {
            email: admin.email,
            adminId: admin._id,
            userType: 'admin',
            token: admin.token
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        admin.tokens = [token];
        await admin.save();

        res.status(200).json({ message: 'Admin login successful',token, tokenPayload });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Failed to login admin', error: error.message });
    }
});

router.post('/create-super-admin', isAdmin, async (req, res) => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await Admin.findOne({ email: 'av556548@gmail.com' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            return res.status(400).json({ message: 'Super admin already exists' });
        }

        // If super admin doesn't exist, create a new one
        const password = 'Admin@1234';
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSuperAdmin = new Admin({
            email: 'av556548@gmail.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Save the new super admin
        await newSuperAdmin.save();

        // Generate token
        const tokenPayload = {
            email: newSuperAdmin.email,
            adminId: newSuperAdmin._id,
            userType: 'admin'
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        // Save the token to the database
        newSuperAdmin.token = token;
        await newSuperAdmin.save();

        console.log('Super admin seeded successfully');
        res.status(201).json({ message: 'Super admin created successfully', token });
    } catch (error) {
        console.error('Error seeding super admin:', error);
        res.status(500).json({ message: 'Failed to seed super admin', error: error.message });
    }
});


router.put('/super-admin-update-email/:id', isAdmin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { newEmail } = req.body;

    try {
        // Find the admin by ID and update the email
        const updatedAdmin = await Admin.findOneAndUpdate(
            { _id: id },
            { email: newEmail },
            { new: true } // To return the updated document
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin email updated successfully', admin: updatedAdmin });
    } catch (error) {
        console.error('Error updating admin email:', error);
        res.status(500).json({ message: 'Failed to update admin email', error: error.message });
    }
});

router.post('/super-admin-logout', authenticateSuperAdmin, superAdminLogout);

// Admin route to get all female users
router.get('/female-users',authenticateAdmin, adminsController.getAllFemaleUsers);

// Admin route to get all male users
router.get('/male-users',authenticateAdmin, adminsController.getAllMaleUsers);



module.exports = router;
