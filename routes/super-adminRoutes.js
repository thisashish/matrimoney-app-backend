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
const SuperAdmin = require('../models/superAdmin');
const superAdminAuthMiddleware = require('../middleware/superAdminAuthMiddleware');

const adminsController = require('../controllers/adminsController');


// Admin login route
router.post('/super-admin-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await SuperAdmin.findOne({ email });

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
            userType: 'super-admin'
        };

        // Generate token
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Update admin document with new token
        admin.token = token;
        await admin.save();

        res.status(200).json({ message: 'Admin login successful', token });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Failed to login admin', error: error.message });
    }
});

router.post('/create-super-admin', isAdmin, async (req, res) => {
    try {
        // Check if super admin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({ email: 'av556548@gmail.com' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            return res.status(400).json({ message: 'Super admin already exists' });
        }

        // If super admin doesn't exist, create a new one
        const password = 'Admin@1234';
        const hashedPassword = await bcrypt.hash(password, 10);
        

        const newSuperAdmin = new SuperAdmin({
            email: 'av556548@gmail.com',
            password: hashedPassword,
            role: 'super-admin'
        });

        // Save the new super admin
        await newSuperAdmin.save();

        // Generate token
        const tokenPayload = {
            email: newSuperAdmin.email,
            adminId: newSuperAdmin._id,
            userType: 'super-admin'
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        // Attach the generated token to the admin document
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
        const updatedAdmin = await SuperAdmin.findOneAndUpdate(
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
router.get('/users-by-gender', authenticateAdmin, adminsController.getUsersByGender);

// Admin route to get all male users
router.get('/male-users', authenticateAdmin, adminsController.getAllMaleUsers);


router.post('/add-admin',superAdminAuthMiddleware, async (req, res) => {
    const { email, adminPassword } = req.body;

    try {
        // Check if the provided email already exists in Admin collection
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash the admin password
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

        // Create a new admin with provided email and hashed password
        const newAdmin = new Admin({
            email,
            password: hashedAdminPassword,
            role: 'admin' 
        });

        // Save the new admin to the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin added successfully', email });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: 'Failed to add admin', error: error.message });
    }
});

// Route to remove an admin by the super admin
router.delete('/remove-admin/:id', authenticateSuperAdmin, async (req, res) => {
    const { id } = req.params;


    try {
        // Find the admin by ID and remove it from the database
        const removedAdmin = await Admin.findByIdAndRemove(id);

        if (!removedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin removed successfully', admin: removedAdmin });
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).json({ message: 'Failed to remove admin', error: error.message });
    }
});

// Route to change password for the super admin
router.put('/change-password', authenticateSuperAdmin, async (req, res) => {
    const { newPassword } = req.body;
    const superAdminId = req.user.adminId; // Assuming you have middleware to extract super admin ID from the JWT

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password for the super admin
        await SuperAdmin.findByIdAndUpdate(superAdminId, { password: hashedPassword });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
});


module.exports = router;