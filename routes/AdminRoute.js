const express = require('express')
const router = express.Router()
const UC = require('../Controllers/UserControllers')
const PC = require('../Controllers/ProductControllers');
const upload = require('../Config/Upload');

router.get('/', UC.Kiemtra);
router.get('/Quanlynguoidung',UC.manager);
router.get('/Quanlysanpham',PC.managerSP);
router.get('/Quanlydanhmuc',PC.managerDM);
router.get('/Quanlydonhang',PC.managerOrder)

router.get('/EditAdUser/:User_id',UC.AEditUser);
router.post('/edit',UC.EditUs);

router.get('/ShowAddDM',PC.ShowAddDM);
router.post('/AddDM',PC.AddDM);

router.get('/ShowEditDM/:Cata_id',PC.ShowEditDM);
router.post('/EditDM',PC.EditDM);
router.get('/DelDM/:Cata_id',PC.DelDM);

router.get('/ShowAddSP', PC.ShowAddSP)
router.post('/AddSP',upload.single("Hinh_Anh"), PC.AddSP)
router.get('/DelSP/:Product_id',PC.DelSP)

router.get('/ShowEditSP/:Product_id',PC.ShowEditSP)
router.post('/EditSP',upload.single("Hinh_Anh"),PC.EditSP)

router.get('/orders/confirm/:id',PC.comfirmOrder)
router.get('/orders/complete/:id',PC.completeOrder)
router.get('/orders/cancel/:id',PC.cancelOrder)
router.get('/orders/del/:id',PC.DelOrder)

module.exports = router
