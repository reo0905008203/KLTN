const express = require('express')
const router = express.Router()
const UC = require('../Controllers/UserControllers')
const PC = require('../Controllers/ProductControllers')

router.post('/login', UC.loginUser);
router.post('/register',UC.registerUser);
router.get('/logout', UC.logout);

router.get('/del/:User_id', UC.DelUser);
router.get('/Cart',UC.ShowCart);
router.get('/checkout',PC.Checkout);
router.get('/orders', UC.ShowOrderHistory);
router.get('/orders/cancel/:id',UC.cancleOrder)
router.get('/search',PC.ShowProductsOfKey)
router.get('/', UC.BackIndex)

module.exports = router
