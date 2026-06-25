const express = require('express');
const {
    createOrder,
    checkoutOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
} = require('../Controller/OrderController');


const router = express.Router();

router.post('/checkout', checkoutOrder);
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);


module.exports = router;
