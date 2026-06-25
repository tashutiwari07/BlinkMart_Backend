const Customer = require('../Models/CustomerModel');

const createCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Customer create nahi hua', error: error.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Customers fetch nahi hue', error: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer nahi mila' });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Customer fetch nahi hua', error: error.message });
    }
};


const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ where: { email } });

        if (!customer || customer.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', customer });
    } catch (error) {
        res.status(500).json({ message: 'Login nahi hua', error: error.message });
    }
};


const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer nahi mila' });
        }

        await customer.update(req.body);
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Customer update nahi hua', error: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer nahi mila' });
        }

        await customer.destroy();
        res.status(200).json({ message: 'Customer delete ho gaya' });
    } catch (error) {
        res.status(500).json({ message: 'Customer delete nahi hua', error: error.message });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    loginCustomer,
    updateCustomer,
    deleteCustomer,
};
