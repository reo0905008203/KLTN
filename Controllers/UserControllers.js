const UserModels = require('../Models/UserModels')
const ProductModels = require('../Models/ProductModels')

exports.loginUser = async(req,res) =>{
    try {
        const {Username,Password} = req.body;
        console.log('Login attempt:', Username);
        
        const user = await UserModels.GetUserByUserid(Username);
        console.log('User found:', user ? 'Yes' : 'No');
        
        if(!user) {
            console.log('User not found in database');
            return res.send(`<script>alert("Tài khoản không tồn tại"); window.location.href="/login";</script>`);
        }

        console.log('Stored password:', user.Mat_Khau);
        console.log('Input password:', Password);
        
        if(Password !== user.Mat_Khau.trim())  {
            console.log('Password mismatch');
            return res.send(`<script>alert("Sai mật khẩu"); window.location.href="/login";</script>`);
        }
        req.session.user = user;
        console.log('Login successful');
        return res.redirect('/')
    } catch(error) {
        console.log('Login error:', error);
        return res.send(`<script>alert("Lỗi đăng nhập: ${error.message}"); window.location.href="/login";</script>`);
    }
};

exports.BackIndex = async(req,res) => {
    try {
        const Pros = await ProductModels.GetAllProduct() || [];
        if(!req.session.user) {
            return res.render('index',{Pros: Pros || []})
        }

        if(req.session.user.Quyen_han == true){
            res.render('Aindex',{Pros: Pros || [], user: req.session.user});
        } else {
            res.render('Uindex',{Pros: Pros || [], user: req.session.user});
        }
    } catch (error) {
        console.log(error);
        // Nếu có lỗi, vẫn render với mảng rỗng
        const Pros = [];
        if(!req.session.user) {
            return res.render('index',{Pros})
        }
        if(req.session.user.Quyen_han == true){
            res.render('Aindex',{Pros});
        } else {
            res.render('Uindex',{Pros});
        }
    }
}

exports.Kiemtra = async(req,res) => {
    try {
        if(!req.session.user) {
            return res.redirect('/login')
        }

        if(req.session.user.Quyen_han == true){
            return res.render('admin.ejs')
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        console.log(error);
    }
}

exports.manager = async(req,res) =>{
    try {
        const Users = await UserModels.GetAllUser();
        res.render('QuanLyUsers',{Users})
    } catch (error) {
        console.log(error)
    }
}

exports.registerUser = async(req,res) => {
    try {
        const {Username,Password,Fullname,Diachi,Phone} = req.body;
        if (!Username || !Password || !Fullname || !Diachi || !Phone ){
            return res.send(`<script>alert("Vui lòng nhập đầy đủ thông tin!"); window.location.href="/register";</script>`);
        }
        const existingUser = await UserModels.GetUserByUserid(Username);
        if(existingUser) {
            return res.send(`<script>alert("Tên người dùng đã tồn tại!"); window.location.href="/register";</script>`);
        }
        var Role = false;
        const newuser = await UserModels.AddUser(Username,Password,Fullname,Diachi,Phone,Role);
        if(newuser) {
            return res.send(`<script>alert("Đăng ký thành công!"); window.location.href="/login";</script>`);
        } else {
            return res.send(`<script>alert("Đăng ký thất bại!"); window.location.href="/register";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.AEditUser = async(req,res) => {
    try {
        const {User_id} = req.params;
        const user = await UserModels.GetUserByUserid(User_id);
        res.render('EditAUsers', {user})
    } catch (error) {
        console.log(error)
    }
}

exports.EditUs = async(req,res) => {
    try {
        const {Username,Password,Fullname,Diachi,Phone} = req.body;
        const pool = await UserModels.EditAdminUser(Username,Password,Fullname,Diachi,Phone)
        if(pool) {
            return res.send(`<script>alert("Update thành công!"); window.location.href="/admin/Quanlynguoidung";</script>`);
        } else {
            return res.send(`<script>alert("Update thất bại!"); window.location.href="/admin/EditAdUser/${Username}";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.DelUser = async(req,res) => {
    try {
        const {User_id} = req.params;
        const pool = await UserModels.DelUser(User_id);
        if (pool) {
            return res.send(`<script>alert("Xóa thành công"); window.location.href="/admin/Quanlynguoidung";</script>`);
        } else {
            return res.send(`<script>alert("Xóa không thành công"); window.location.href="/admin/Quanlynguoidung";</script>`);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ShowCart = async(req,res) => {
    try {
        const user = req.session.user
        if(!user){
            return res.redirect('/login')
        }
        const userid = user.User_id;
        const cartItems = await UserModels.GetCartbyUserid(userid);
        let total = 0;
        cartItems.forEach(item => total += item.Gia * item.So_Luong);

        res.render('Cart',{cartItems, total})
    } catch (error) {
        console.log(error)
    }
}

exports.ShowOrderHistory = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.redirect('/login');

        const orders = await UserModels.GetOrdersByUserId(user.User_id);
        res.render('DonHangCuaUser', { orders, user: req.session.user });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};

exports.cancleOrder = async (req, res) => {
    try {
        const Orderid = req.params.id;
        const user = req.session.user;
        if (!user) return res.redirect('/login');

        const result = await UserModels.cancelOrder(user.User_id,Orderid);
        if (result) {
            await ProductModels.UpdateQualityProductAdd(Orderid);
            res.send(`<script>alert("Hủy đơn hàng thành công!"); window.location.href='/orders';</script>`);
        } else {
            res.send(`<script>alert("Không thể hủy đơn hàng!"); window.location.href='/orders';</script>`);
        }
    } catch (error) {
        console.log(error);
    }
}

exports.logout = async(req,res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}
