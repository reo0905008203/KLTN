const sql = require('mssql')
const DB = require('../Config/ConnectDB')

exports.GetAllUser = async() => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .query('SELECT * FROM USERS');
        return result.recordset;
    } catch (error) {
        console.log(error);
    }
}

exports.GetUserByUserid = async(Username) => {
    try {
        console.log('Connecting to database...');
        console.log('Querying user:', Username);
        const pool = await sql.connect(DB);
        console.log('Database connected');
        
        // Sử dụng RTRIM để so sánh (vì CHAR(10) có thể có trailing spaces)
        const result = await pool
            .request()
            .input('User_id',sql.NVarChar(50), Username.trim())
            .query('SELECT * FROM USERS WHERE RTRIM(User_id) = @User_id');
        
        console.log('Query result:', result.recordset.length, 'rows');
        if(result.recordset.length > 0) {
            console.log('User found:', result.recordset[0].User_id, '- Password length:', result.recordset[0].Mat_Khau ? result.recordset[0].Mat_Khau.length : 'null');
        } else {
            console.log('No user found with username:', Username);
        }
        
        return result.recordset[0];
    }
    catch (error){
        console.log('GetUserByUserid error:', error);
        return null;
    }
}

exports.AddUser = async(Username,Password,Fullname,Diachi,Phone,Role) => {
    try {
       const pool = await sql.connect(DB)
       await pool
            .request()
            .input('User_id',sql.Char,Username)
            .input('Mat_Khau',sql.Char,Password)
            .input('Ho_Ten_User',sql.NVarChar,Fullname)
            .input('Dia_Chi_User',sql.NVarChar,Diachi)
            .input('Phone',sql.Char,Phone)
            .input('Quyen_han',sql.Bit,Role)
            .query('insert into USERS(User_id,Mat_Khau,Ho_Ten_User,Dia_Chi_User,Phone,Quyen_han) values(@User_id,@Mat_Khau,@Ho_Ten_User,@Dia_Chi_User,@Phone,@Quyen_han)');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.DelUser = async(User_id) => {
    try {
        const pool = await sql.connect(DB)
        await pool
            .request()
            .input('User_id',sql.Char,User_id)
            .query('delete from USERS where User_id = @User_id')
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.EditAdminUser = async(Username,Password,Fullname,Diachi,Phone) => {
    try {
        const pool = await sql.connect(DB)
        await pool
            .request()
            .input('User_id',sql.Char,Username)
            .input('Mat_Khau',sql.Char,Password)
            .input('Ho_Ten_User',sql.NVarChar,Fullname)
            .input('Dia_Chi_User',sql.NVarChar,Diachi)
            .input('Phone',sql.Char,Phone)
            .query('UPDATE USERS SET Mat_Khau = @Mat_Khau, Ho_Ten_User = @Ho_Ten_User, Dia_Chi_User = @Dia_Chi_User, Phone = @Phone where User_id = @User_id');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.GetCartbyUserid = async(Userid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid',sql.Char,Userid)
            .query(`SELECT c.Cart_id, p.Product_id, p.Ten_Product, p.Gia, p.Anh_SP, c.So_Luong
                FROM Cart c
                JOIN Products p ON c.Productid = p.Product_id
                WHERE c.Userid = @Userid`);
        return result.recordset;
    } catch (error) {
        console.log(error)
    }
}

exports.InsertComment = async (productId, userId, noiDung) => {
    try {
        const pool = await sql.connect(DB);
        await pool.request()
            .input('Productid', sql.Char, productId)
            .input('Userid', sql.Char, userId)
            .input('Noi_dung', sql.NVarChar, noiDung)
            .query(`INSERT INTO DanhGia (Userid, Productid, Noi_dung) VALUES (@Userid, @Productid, @Noi_dung)`);
        return true;
    } catch (error) {
        console.log(error)
        return false
    }
};

exports.GetOrdersByUserId = async (userId) => {
    const pool = await sql.connect(DB);
    const result = await pool.request()
        .input('Userid', sql.Char(10), userId)
        .query(`
            SELECT DH.Order_id, DH.Ngay_Dat, DH.Tong_Gia, DH.Trang_Thai,
                   SP.Ten_Product, SP.Anh_SP, CT.So_Luong, SP.Gia
            FROM DonHang DH
            JOIN ChiTietDonHang CT ON DH.Order_id = CT.Orderid
            JOIN Products SP ON CT.Productid = SP.Product_id
            WHERE DH.Userid = @Userid
            ORDER BY DH.Ngay_Dat DESC
        `);
    return result.recordset;
};

exports.cancelOrder = async(Userid,Orderid) => {
    try {
        const pool = await sql.connect(DB)
        const check = await pool.request()
        .input('Order_id', sql.Int, Orderid)
        .input('Userid', sql.Char(10), Userid)
        .query(`
            SELECT * FROM DonHang 
            WHERE Order_id = @Order_id AND Userid = @Userid AND Trang_Thai = N'Chờ xử lý'
        `);

        if (check.recordset.length === 0) return false;

        await pool.request()
            .input('Order_id', sql.Int, Orderid)
            .query(`UPDATE DonHang SET Trang_Thai = N'Hủy' WHERE Order_id = @Order_id`);
        return true;

    } catch (error) {
        console.log(error)
        return false;
    }
}
