const Admin = require('../Models/AdminModels');

const createAdmin = async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Admin create nahi hua', error: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Admins fetch nahi hue', error: error.message });
    }
};

const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin nahi mila' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Admin fetch nahi hua', error: error.message });
    }
};


const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ where: { email } });

        if (!admin || admin.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', admin });
    } catch (error) {
        res.status(500).json({ message: 'Login nahi hua', error: error.message });
    }
};


const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin nahi mila' });
        }

        await admin.update(req.body);
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Admin update nahi hua', error: error.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin nahi mila' });
        }

        await admin.destroy();
        res.status(200).json({ message: 'Admin delete ho gaya' });
    } catch (error) {
        res.status(500).json({ message: 'Admin delete nahi hua', error: error.message });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    getAdminById,
    loginAdmin,
    updateAdmin,
    deleteAdmin,
};
