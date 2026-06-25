const Product = require('../Models/ProductModels');

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const amount = req.body.amount ?? req.body.price;
        const Quantity = req.body.Quantity ?? req.body.quantity;
        const product = await Product.create({ name, description, amount, image, Quantity });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image } = req.body;
        const amount = req.body.amount ?? req.body.price;
        const Quantity = req.body.Quantity ?? req.body.quantity;
        const UpdateProduct = await Product.findByPk(id);
        if (!UpdateProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await UpdateProduct.update({ name, description, amount, image, Quantity });
        res.status(200).json(UpdateProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // const product = await Product.findByPk(id);
        const deletedProduct = await Product.destroy({ where: { id } });
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
