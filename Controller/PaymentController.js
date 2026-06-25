const Payment = require('../Models/PaymentModels');
const Order = require('../Models/OrderModels');

const createRazorpayOrder = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const razorpayEnabled = process.env.RAZORPAY_ENABLED === 'true';
        const amount = Math.round(Number(req.body.amount || 0) * 100);

        if (!razorpayEnabled) {
            return res.status(400).json({ message: 'Razorpay enabled nahi hai' });
        }

        if (!keyId || !keySecret) {
            return res.status(500).json({ message: 'Razorpay keys missing hain' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid payment amount required hai' });
        }

        const authToken = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                currency: req.body.currency || 'INR',
                receipt: req.body.receipt || `blinkit_${Date.now()}`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.error?.description || 'Razorpay order create nahi hua',
                error: data.error || data,
            });
        }

        res.status(201).json({
            id: data.id,
            amount: data.amount,
            currency: data.currency,
            receipt: data.receipt,
            status: data.status,
            keyId,
        });
    } catch (error) {
        res.status(500).json({ message: 'Razorpay order create nahi hua', error: error.message });
    }
};

const createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        const paymentWithOrder = await Payment.findByPk(payment.id, { include: Order });
        res.status(201).json(paymentWithOrder);
    } catch (error) {
        res.status(500).json({ message: 'Payment create nahi hua', error: error.message });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({ include: Order });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Payments fetch nahi hue', error: error.message });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, { include: Order });

        if (!payment) {
            return res.status(404).json({ message: 'Payment nahi mila' });
        }

        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Payment fetch nahi hua', error: error.message });
    }
};

const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment nahi mila' });
        }

        await payment.update(req.body);
        const updatedPayment = await Payment.findByPk(payment.id, { include: Order });
        res.status(200).json(updatedPayment);
    } catch (error) {
        res.status(500).json({ message: 'Payment update nahi hua', error: error.message });
    }
};

const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment nahi mila' });
        }

        await payment.destroy();
        res.status(200).json({ message: 'Payment delete ho gaya' });
    } catch (error) {
        res.status(500).json({ message: 'Payment delete nahi hua', error: error.message });
    }
};

module.exports = {
    createRazorpayOrder,
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
};

