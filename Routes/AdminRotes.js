const express = require('express');
const {
    createAdmin,
    getAllAdmins,
    getAdminById,
    loginAdmin,
    updateAdmin,
    deleteAdmin,
} = require('../Controller/AdminController');

const router = express.Router();

router.post('/register', createAdmin);
router.post('/login', loginAdmin);
router.get('/', getAllAdmins);
router.get('/:id', getAdminById);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router;
