const Order = require('../Models/OrderModels');
const Customer = require('../Models/CustomerModel');
const Product = require('../Models/ProductModels');
const Payment = require('../Models/PaymentModels');
const { sequelize } = require('../Config/db');
const crypto = require('crypto');

const orderIncludes = [Customer, Product, Payment];

const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        const orderWithDetails = await Order.findByPk(order.id, { include: orderIncludes });
        res.status(201).json(orderWithDetails);
    } catch (error) {
        res.status(500).json({ message: 'Order create nahi hua', error: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ include: orderIncludes });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Orders fetch nahi hue', error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const { customerId } = req.query;
        if (!customerId) {
            return res.status(400).json({ message: 'customerId required' });
        }

        const orders = await Order.findAll({
            where: { customerId },
            include: orderIncludes,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'My Orders fetch nahi hue', error: error.message });
    }
};


const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: orderIncludes });

        if (!order) {
            return res.status(404).json({ message: 'Order nahi mila' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Order fetch nahi hua', error: error.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order nahi mila' });
        }

        await order.update(req.body);
        const updatedOrder = await Order.findByPk(order.id, { include: orderIncludes });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Order update nahi hua', error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order nahi mila' });
        }

        await order.destroy();
        res.status(200).json({ message: 'Order delete ho gaya' });
    } catch (error) {
        res.status(500).json({ message: 'Order delete nahi hua', error: error.message });
    }
};

const checkoutOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { customer = {}, address = {}, items = [], payment = {}, totals = {} } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Cart empty hai' });
        }

        const isCashOnDelivery = payment.gateway === 'cash_on_delivery' || payment.method === 'cash';
        const validPaymentStatus = isCashOnDelivery
            ? ['pending', 'success'].includes(payment.status)
            : payment.status === 'success';

        if (!validPaymentStatus) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Payment status valid nahi hai' });
        }

        if (!isCashOnDelivery && payment.gateway === 'razorpay') {
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(`${payment.razorpayOrderId}|${payment.razorpayPaymentId}`)
                .digest('hex');

            if (!payment.razorpaySignature || expectedSignature !== payment.razorpaySignature) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Razorpay payment verify nahi hua' });
            }
        }

        const customerId = customer.id || customer.customerId;
        const phone = String(customer.phone || '').trim();
        const email = String(customer.email || `${phone || Date.now()}@dummy.blinkit`).trim().toLowerCase();
        const fullAddress = [
            address.street,
            address.city,
            address.pincode,
        ].filter(Boolean).join(', ');

        let savedCustomer = null;

        if (customerId) {
            savedCustomer = await Customer.findByPk(customerId, { transaction });

            if (!savedCustomer) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Logged-in customer nahi mila' });
            }
        } else {
            [savedCustomer] = await Customer.findOrCreate({
                where: { email },
                defaults: {
                    name: customer.name || 'Blinkit Customer',
                    email,
                    password: customer.password || 'checkout123',
                    phone,
                    address: fullAddress,
                },
                transaction,
            });
        }

        await savedCustomer.update({
            name: customer.name || savedCustomer.name,
            phone: phone || savedCustomer.phone,
            address: fullAddress || savedCustomer.address,
        }, { transaction });

        const createdOrders = [];

        for (const item of items) {
            const productId = Number(item.id);
            const quantity = Number(item.quantity || 1);
            const amount = Number(item.amount || 0);

            if (!productId || quantity <= 0) {
                continue;
            }

            await Product.findOrCreate({
                where: { id: productId },
                defaults: {
                    id: productId,
                    name: item.name || `Product ${productId}`,
                    description: item.description || '',
                    amount,
                    image: item.image || '',
                    Quantity: 100,
                },
                transaction,
            });

            const order = await Order.create({
                customerId: savedCustomer.id,
                productId,
                quantity,
            }, { transaction });

            const lineAmount = amount * quantity;
            const paymentMethod = isCashOnDelivery ? 'cash' : (payment.method || 'upi');
            const paymentStatus = isCashOnDelivery ? (payment.status || 'pending') : 'success';
            const transactionPrefix = payment.transactionId || payment.razorpayPaymentId || (isCashOnDelivery ? 'cash_on_delivery' : 'dummy_razorpay');
            const transactionId = `${transactionPrefix}_${order.id}`;

            await Payment.create({
                orderId: order.id,
                amount: lineAmount,
                paymentMethod,
                paymentStatus,
                transactionId,
            }, { transaction });

            createdOrders.push(order);
        }

        if (createdOrders.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Valid order items nahi mile' });
        }

        await transaction.commit();

        const orders = await Order.findAll({
            where: { id: createdOrders.map((order) => order.id) },
            include: orderIncludes,
        });

        res.status(201).json({
            message: isCashOnDelivery ? 'Cash On Delivery order save ho gaya' : 'Order payment ke baad save ho gaya',
            customer: savedCustomer,
            orders,
            totals,
            payment: {
                gateway: payment.gateway || (isCashOnDelivery ? 'cash_on_delivery' : 'razorpay_dummy'),
                method: isCashOnDelivery ? 'cash' : (payment.method || 'upi'),
                status: isCashOnDelivery ? (payment.status || 'pending') : payment.status,
                razorpayPaymentId: payment.razorpayPaymentId,
                razorpayOrderId: payment.razorpayOrderId,
            },
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Checkout order save nahi hua', error: error.message });
    }
};

module.exports = {
    createOrder,
    checkoutOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
};
