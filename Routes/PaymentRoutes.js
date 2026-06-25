const express = require('express');
const {
    createRazorpayOrder,
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} = require('../Controller/PaymentController');

const router = express.Router();

router.post('/razorpay-order', createRazorpayOrder);
router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
