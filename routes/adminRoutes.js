router.post('/super-admin/login', authController.superAdminLogin);
router.post('/super-admin/add-admin', authenticateSuperAdmin, authController.addAdmin);
