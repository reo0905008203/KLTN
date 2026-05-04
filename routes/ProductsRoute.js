const express = require('express')
const router = express.Router()
const PC = require('../Controllers/ProductControllers');

router.get('/',PC.ShowProducts);
router.get('/cata/:id',PC.ShowProductsOfCata);
router.get('/:id',PC.ShowdetailProduct);
router.post('/cart/add',PC.AddToCart);
router.get('/cart/del/:id',PC.DelProToCart);
router.post('/:id/comment',PC.AddComment)
router.post('/cart/update/:id',PC.UpdateCartQuantity)
module.exports = router
