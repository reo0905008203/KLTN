const ProductModel = require('../Models/ProductModels')
const UserModel = require('../Models/UserModels')


exports.managerSP = async(req,res) => {
    try {
        const Products = await ProductModel.GetAllProduct();
        res.render('QuanLySanPham', {Products})
    } catch (error) {
        console.log(error);
    }
}

exports.managerDM = async(req,res) => {
    try {
        const Catas = await ProductModel.GetAllCata();
        res.render('QuanLyDanhMuc', {Catas})
    } catch (error) {
        console.log(error);
    }
}

exports.managerOrder = async(req,res) => {
    try {
        const orders = await ProductModel.GetAllOrder();
        res.render('QuanLyDonHang', {orders})
    } catch (error) {
        console.log(error);
    }
}

exports.comfirmOrder = async(req,res) => {
    try {
        const id = req.params.id;
        const pool = await ProductModel.UpdateOrderStatus(id, "Xác nhận")
        if (pool) {
            return res.send(`<script>alert("Xác nhận đơn hàng thành công"); window.location.href="/admin/Quanlydonhang";</script>`);
        } else {
            return res.send(`<script>alert("Xác nhận đơn hàng thất bại"); window.history.back();</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.completeOrder = async(req,res) => {
    try {
        const id = req.params.id;
        const pool = await ProductModel.UpdateOrderStatus(id, "Hoàn thành")
        if (pool) {
            await ProductModel.UpdatePaymentStatus(id);
            return res.send(`<script>alert("Hoàn thành đơn hàng thành công"); window.location.href="/admin/Quanlydonhang";</script>`);
        } else {
            return res.send(`<script>alert("Hoàn thành đơn hàng thất bại"); window.history.back();</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.cancelOrder = async(req,res) => {
    try {
        const id = req.params.id;
        const pool = await ProductModel.UpdateOrderStatus(id, "Hủy")
        if (pool) {
            await ProductModel.UpdateQualityProductAdd(id);
            return res.send(`<script>alert("Hủy đơn hàng thành công"); window.location.href="/admin/Quanlydonhang";</script>`);
        } else {
            return res.send(`<script>alert("Hủy nhận đơn hàng thất bại"); window.history.back();</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.DelOrder = async(req,res) => {
    try {
        const id = req.params.id;
        const pool = await ProductModel.DelOrder(id)
        if (pool) {
            return res.send(`<script>alert("Xóa đơn hàng thành công"); window.location.href="/admin/Quanlydonhang";</script>`);
        } else {
            return res.send(`<script>alert("Xóa đơn hàng thất bại"); window.history.back();</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowAddDM = async(req,res) => {
    res.render('AddDanhMuc');
}

exports.AddDM = async(req,res) => {
    try {
        const {Cataid,TenDanhMuc} = req.body;
        const Cata = await ProductModel.GetCatabyCataid(Cataid);
        if(Cata) {
            return res.send(`<script>alert("Mã Danh Mục Đã Tồn Tại"); window.location.href="/admin/AddDM";</script>`);
        }
        const pool = await ProductModel.AddCata(Cataid,TenDanhMuc);
        if(pool) {
            return res.send(`<script>alert("Thêm thành công!"); window.location.href="/admin/Quanlydanhmuc";</script>`);
        } else {
            return res.send(`<script>alert("Thêm thất bại!"); window.location.href="/admin/ShowAddDM";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowEditDM = async(req,res) => {
    try {
        const {Cata_id} = req.params;
        const Cata = await ProductModel.GetCatabyCataid(Cata_id);
        res.render('EditDanhMuc',{Cata});
    } catch (error) {
        console.log(error)
    }
}

exports.EditDM = async(req,res) => {
    try {
        const {Cataid,TenDanhMuc} = req.body;
        const pool = await ProductModel.EditCata(Cataid,TenDanhMuc);
        if(pool) {
            return res.send(`<script>alert("Sửa thành công!"); window.location.href="/admin/Quanlydanhmuc";</script>`);
        } else {
            return res.send(`<script>alert("Sửa thất bại!"); window.location.href="/admin/ShowEditDM/${Cataid}";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.DelDM = async(req,res) => {
    try {
        const {Cata_id} = req.params;
        const pool = await ProductModel.DelCata(Cata_id);
        if(pool){
            return res.send(`<script>alert("Xóa thành công!"); window.location.href="/admin/Quanlydanhmuc";</script>`);
        } else {
            return res.send(`<script>alert("Xóa thất bại!"); window.location.href="/admin/Quanlydanhmuc";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowAddSP = async(req,res) => {
    try {
        const Catas = await ProductModel.GetAllCata();
        res.render('AddSanPham',{Catas})
    } catch (error) {
        console.log(error)
    }
}

exports.AddSP = async(req,res) => {
    try {
        const {Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong} = req.body
        const Hinh_Anh = req.file ? `/uploads/${req.file.filename}` : null;
        const Product = await ProductModel.GetProByProid(Ma_SP);

        if(Product) {
            return res.send(`<script>alert("Mã Sản Phẩm Đã Tồn Tại"); window.location.href="/admin/ShowAddSP";</script>`);
        }

        const pool = await ProductModel.AddProduct(Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong,Hinh_Anh);
        if(pool) {
            return res.send(`<script>alert("Thêm thành công!"); window.location.href="/admin/Quanlysanpham";</script>`);
        } else {
            return res.send(`<script>alert("Thêm thất bại!"); window.location.href="/admin/ShowAddSP";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.DelSP = async(req,res) => {
    try {
        const {Product_id} = req.params;
        const pool = await ProductModel.DelSP(Product_id);
        if(pool){
            return res.send(`<script>alert("Xóa thành công!"); window.location.href="/admin/Quanlysanpham";</script>`);
        } else {
            return res.send(`<script>alert("Xóa thất bại!"); window.location.href="/admin/Quanlysanpham";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowEditSP = async(req,res) => {
    try {
        const {Product_id} = req.params
        const pro = await ProductModel.GetProByProid(Product_id);
        const Catas = await ProductModel.GetAllCata();
        res.render('EditSanPham',{pro,Catas})
    } catch (error) {
        console.log(error)
    }
}

exports.EditSP = async(req,res) => {
    try {
        const {Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong} = req.body
        const Hinh_Anh = req.file ? `/uploads/${req.file.filename}` : null;
        const pool = await ProductModel.EditSP(Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong,Hinh_Anh)
        if(pool){
            return res.send(`<script>alert("Sửa thành công!"); window.location.href="/admin/Quanlysanpham";</script>`);
        } else {
            return res.send(`<script>alert("Sửa thất bại!"); window.location.href="/admin/Quanlysanpham";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowProducts = async(req,res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const offset = (page - 1) * limit;

        const totalProducts = await ProductModel.getTotalProducts();
        const totalPages = Math.ceil(totalProducts / limit);
        const Products = await ProductModel.getPaginatedProducts(limit, offset);
        const Catas = await ProductModel.GetAllCata();
        if(!req.session.user) {
            return res.render('Products', {
                Products,
                Catas,
                currentPage: page,
                totalPages
            });
        }

        if(req.session.user.Quyen_han == true){
            return res.render('AProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        } else {
            return res.render('UProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        }
    } catch (error) {
        console.error(error);
    }
}

exports.ShowProductsOfCata = async(req,res) => {
    try {
        const cataid = req.params.id
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const offset = (page - 1) * limit;
        const totalProducts = await ProductModel.getTotalProductsinCata(cataid);
        const totalPages = Math.ceil(totalProducts / limit);
        const Catas = await ProductModel.GetAllCata();
        const Products =  await ProductModel.getPaginatedProductsbyCataid(limit,offset,cataid);
        if(!req.session.user) {
            return res.render('Products', {
                Products,
                Catas,
                currentPage: page,
                totalPages
            });
        }

        if(req.session.user.Quyen_han == true){
            return res.render('AProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        } else {
            return res.render('UProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowdetailProduct = async(req,res) => {
    try {
        const Productid = req.params.id;
        const product = await ProductModel.GetProByProid(Productid);
        const comments = await ProductModel.GetComments(Productid);
        const Danh_Muc_id = product.Danh_Muc_id 
        const relatedProducts = await ProductModel.relatedProducts(Productid,Danh_Muc_id)
        if(!req.session.user) {
            return res.render('DetailProduct',{product,comments,relatedProducts})
        }

        if(req.session.user.Quyen_han == true){
            return res.render('ADetailProduct',{product,comments,relatedProducts, user: req.session.user})
        } else {
            res.render('UDetailProduct',{product,comments,relatedProducts, user: req.session.user})
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowProductsOfKey = async(req,res) => {
    try {
        const keyword = req.query.keyword || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const offset = (page - 1) * limit;
        const totalProducts = await ProductModel.getTotalProductsbykey(keyword)
        const totalPages = Math.ceil(totalProducts / limit);
        const Catas = await ProductModel.GetAllCata();
        const Products =  await ProductModel.getPaginatedProductsbykey(limit,offset,keyword)
        if(!req.session.user) {
            return res.render('Products', {
                Products,
                Catas,
                currentPage: page,
                totalPages
            });
        }

        if(req.session.user.Quyen_han == true){
            return res.render('AProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        } else {
            return res.render('UProducts', {
                Products,
                Catas,
                currentPage: page,
                totalPages,
                user: req.session.user
            });
        }
    } catch (error) {
        console.log(error)
    }
}

exports.AddToCart = async(req,res) => {
    try {
        const user = req.session.user;
        if(!user) {
            return res.send(`<script>alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"); window.history.back();</script>`);
        }
        const userId = user.User_id
        var { Product_id,So_Luong} = req.body;
        const checkProduct = await ProductModel.GetProByProid(Product_id);
        if(checkProduct.So_Luong < 1) {
            return res.send(`<script>alert("sản phẩm hết hàng"); window.history.back();</script>`);
        }
        const existingItem = await ProductModel.CheckProductInCart(userId, Product_id);
        if (So_Luong == null) {
            So_Luong = 1
        }
        const quantity = parseInt(So_Luong);
        let success = false;

        if (existingItem) {
            success = await ProductModel.UpdateCartQuantity(userId, Product_id, existingItem.So_Luong + quantity);
        } else {
            success = await ProductModel.AddProToCart(userId, Product_id, quantity);
        }

        if (success) {
            res.redirect('/Cart');
        } else {
            res.send(`<script>alert("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!"); window.history.back();</script>`);
        }

    } catch (error) {
        console.log(error)
    }
}

exports.DelProToCart= async(req,res) => {
    try {
        const Cart_id = req.params.id;
        const pool = await ProductModel.DelProToCart(Cart_id)
        if(pool) {
            return res.send(`<script>alert("Xóa thành công!"); window.location.href="/Cart";</script>`);
        } else {
            return res.send(`<script>alert("Xóa không thành công!"); window.location.href="/Cart";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.Checkout = async(req,res) => {
    try {
        const User_id = req.session.user.User_id;
        const cartItems = await UserModel.GetCartbyUserid(User_id);
        let total = 0;
            cartItems.forEach(item => total += item.Gia * item.So_Luong);
        const newOrderId  = await ProductModel.CreateOrder(User_id,total);
        for(const item of cartItems){
            await ProductModel.AddOrderDetail(newOrderId.Order_id,item.Product_id,item.So_Luong)
            await ProductModel.UpdateSoLuong(item.Product_id,item.So_Luong)
        }
    
        await ProductModel.CreatePayment(newOrderId.Order_id, "Thanh toán khi nhận hàng", "Chưa thanh toán");
    
        await ProductModel.ClearCart(User_id);

        res.send(`<script>alert("Đặt hàng thành công!"); window.location.href="/";</script>`);
    } catch (error) {
        console.log(error)
        res.send(`<script>alert("Đặt hàng thất bại, vui lòng thử lại!"); window.location.href="/Cart";</script>`);
    }
}

exports.AddComment = async(req,res) => {
    try {
        const productId = req.params.id;
        const { Noi_dung } = req.body;
        const userId = req.session.user.User_id;

        if (!Noi_dung) {
            return res.send(`<script>alert("Bình luận không thể để trống!"); window.history.back();</script>`);
        }

        const result = await UserModel.InsertComment(productId,userId,Noi_dung)

        if (result) {
            return res.send(`<script>alert("Bình luận đã được thêm!"); window.location.href = '/Products/${productId}';</script>`);
        } else {
            return res.send(`<script>alert("Có lỗi khi thêm bình luận!"); window.history.back();</script>`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Có lỗi xảy ra!');
    }
}

exports.UpdateCartQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const cartItem = await ProductModel.GetCartItemById(id);
        const product = await ProductModel.GetProByProid(cartItem.Productid)
        if (!cartItem) return res.redirect("/Cart");

        let newQuantity = cartItem.So_Luong;

        if (action === "increase") 
        {
            if (newQuantity < product.So_Luong) {
                newQuantity++;
            }
            else  {
                return res.send(`<script>alert("Số lượng đã vượt quá số lượng có trong kho!"); window.history.back();</script>`);
            }
        }
        if (action === "decrease" && newQuantity > 1) newQuantity--;

        await ProductModel.UpdateCartItemQuantity(id, newQuantity);

        res.redirect("/Cart");
    } catch (error) {
        console.log(error);
        res.redirect("/Cart");
    }
};
