const sql = require('mssql')
const DB = require('../Config/ConnectDB')
const moment = require('moment-timezone');
const GetDate = moment.tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD HH:mm:ss');

exports.GetAllProduct = async() => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .query('select * from Products inner join Catalogue on Products.Danh_Muc_id = Catalogue.Cata_id');
        return result.recordset;
    } catch (error) {
        console.log('GetAllProduct error:', error);
        return [];
    }
}

exports.GetAllCata = async() => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .query('select * from Catalogue');
        return result.recordset;
    } catch (error) {
        console.log(error);
    }
}

exports.GetCatabyCataid = async(Cata_id) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Cata_id',sql.Char,Cata_id)
            .query('select * from Catalogue where Cata_id = @Cata_id');
        return result.recordset[0];
    } catch (error) {
        console.log(error);
    }
}

exports.GetProByProid = async(Productid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Product_id',sql.Char,Productid)
            .query('SELECT * FROM Products inner join Catalogue on Products.Danh_Muc_id = Catalogue.Cata_id  WHERE Product_id = @Product_id');
        return result.recordset[0];
    }
    catch (error){
        console.log(error);
    }
}

exports.GetComments = async(Productid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Productid',sql.Char,Productid)
            .query('SELECT * FROM DanhGia inner join USERS on DanhGia.Userid = USERS.User_id  WHERE Productid = @Productid');
        return result.recordset;
    } catch (error) {
        console.log(error)
    }
}

exports.relatedProducts = async(Productid,Cataid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Product_id',sql.Char,Productid)
            .input('Danh_muc_id',sql.Char,Cataid)
            .query('SELECT TOP 4 * FROM Products WHERE Danh_Muc_id = @Danh_muc_id AND Product_id <> @Product_id');
        return result.recordset;
    } catch (error) {
        console.log(error)
    }
}

exports.AddCata = async(Cataid,TenDanhMuc) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Cata_id',sql.Char,Cataid)
            .input('Ten_Cata',sql.NVarChar,TenDanhMuc)
            .query('insert into Catalogue(Cata_id,Ten_Cata) values(@Cata_id,@Ten_Cata)');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.EditCata = async(Cataid,TenDanhMuc) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Cata_id',sql.Char,Cataid)
            .input('Ten_Cata',sql.NVarChar,TenDanhMuc)
            .query('Update Catalogue Set Ten_Cata = @Ten_Cata Where Cata_id = @Cata_id');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.DelCata = async(Cata_id) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Cata_id',sql.Char,Cata_id)
            .query('Delete from Catalogue where Cata_id = @Cata_id');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.AddProduct = async(Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong,Hinh_Anh) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Product_id',sql.Char,Ma_SP)
            .input('Ten_Product',sql.NVarChar,Ten_SP)
            .input('Mo_Ta_Product',sql.NVarChar,Mo_Ta)
            .input('Danh_Muc_id',sql.Char,Danh_Muc)
            .input('Anh_SP',sql.VarChar,Hinh_Anh)
            .input('Gia',sql.Decimal,Gia)
            .input('So_Luong',sql.Int,So_Luong)
            .query('insert into Products(Product_id,Ten_Product,Mo_Ta_Product,Danh_Muc_id,Anh_SP,Gia,So_Luong) values(@Product_id,@Ten_Product,@Mo_Ta_Product,@Danh_Muc_id,@Anh_SP,@Gia,@So_Luong)');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.DelSP = async(Product_id) => {
    try {
        const pool = await sql.connect(DB);
        await pool
            .request()
            .input('Product_id',sql.Char,Product_id)
            .query('Delete from Products where Product_id = @Product_id');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.EditSP = async(Ma_SP,Ten_SP,Mo_Ta,Danh_Muc,Gia,So_Luong,Hinh_Anh) => {
    try {
        const pool = await sql.connect(DB);
        if(Hinh_Anh) {
            const result = await pool
                .request()
                .input('Product_id',sql.Char,Ma_SP)
                .input('Ten_Product',sql.NVarChar,Ten_SP)
                .input('Mo_Ta_Product',sql.NVarChar,Mo_Ta)
                .input('Danh_Muc_id',sql.Char,Danh_Muc)
                .input('Anh_SP',sql.VarChar,Hinh_Anh)
                .input('Gia',sql.Decimal,Gia)
                .input('So_Luong',sql.Int,So_Luong)
                .query('Update Products Set Ten_Product = @Ten_Product,Mo_Ta_Product = @Mo_Ta_Product,Danh_Muc_id = @Danh_Muc_id,Anh_SP = @Anh_SP,Gia = @Gia,So_Luong = @So_Luong Where Product_id = @Product_id');
        } else {
            const result = await pool
                .request()
                .input('Product_id',sql.Char,Ma_SP)
                .input('Ten_Product',sql.NVarChar,Ten_SP)
                .input('Mo_Ta_Product',sql.NVarChar,Mo_Ta)
                .input('Danh_Muc_id',sql.Char,Danh_Muc)
                .input('Gia',sql.Decimal,Gia)
                .input('So_Luong',sql.Int,So_Luong)
                .query('Update Products Set Ten_Product = @Ten_Product,Mo_Ta_Product = @Mo_Ta_Product,Danh_Muc_id = @Danh_Muc_id,Gia = @Gia,So_Luong = @So_Luong Where Product_id = @Product_id');
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.CheckProductInCart = async (userId, productId) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid', sql.Char, userId)
            .input('Productid', sql.Char, productId)
            .query('SELECT * FROM Cart WHERE Userid = @Userid AND Productid = @Productid');
        return result.recordset[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.AddProToCart = async(userid,Productid,quantity) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid', sql.Char, userid)
            .input('Productid', sql.Char, Productid)
            .input('So_Luong', sql.Int, quantity)
            .query('INSERT INTO Cart (Userid, Productid, So_Luong) VALUES (@Userid, @Productid, @So_Luong)');
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

exports.UpdateCartQuantity = async (userId, productId, quantity) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid', sql.Char, userId)
            .input('Productid', sql.Char, productId)
            .input('So_Luong', sql.Int, quantity)
            .query('UPDATE Cart SET So_Luong = @So_Luong WHERE Userid = @Userid AND Productid = @Productid');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.DelProToCart = async (id) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Cart_id',sql.Int,id)
            .query('Delete from Cart where Cart_id = @Cart_id');
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.CreateOrder = async (Userid,Tong_Gia) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid', sql.Char, Userid)
            .input('Ngay_Dat', sql.DateTime, GetDate)
            .input('Tong_Gia', sql.Decimal(10, 2), Tong_Gia)
            .input('Trang_Thai', sql.NVarChar, 'Chờ xử lý')
            .query(`INSERT INTO DonHang (Userid, Ngay_Dat, Tong_Gia, Trang_Thai)
                    OUTPUT INSERTED.Order_id
                    VALUES (@Userid, @Ngay_Dat, @Tong_Gia, @Trang_Thai)`);
        return result.recordset[0];
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.AddOrderDetail = async (orderId, productId, quantity) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Orderid', sql.Int, orderId)
            .input('Productid', sql.Char, productId)
            .input('So_Luong', sql.Int, quantity)
            .query(`INSERT INTO ChiTietDonHang (Orderid, Productid, So_Luong) 
                    VALUES (@Orderid, @Productid, @So_Luong)`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.CreatePayment = async (orderId, method, status) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Orderid', sql.Int, orderId)
            .input('Phuong_Thuc', sql.NVarChar, method)
            .input('Trang_Thai', sql.NVarChar, status)
            .input('Ngay_Thanh_Toan', sql.DateTime, GetDate)
            .query(`INSERT INTO ThanhToan (Orderid, Phuong_Thuc, Trang_Thai, Ngay_Thanh_Toan) 
                    VALUES (@Orderid, @Phuong_Thuc, @Trang_Thai, @Ngay_Thanh_Toan)`);
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.ClearCart = async (userid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Userid',sql.Char,userid)
            .query('Delete from Cart where Userid = @Userid');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.GetAllOrder = async () => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .query(`SELECT 
                        D.Order_id, 
                        D.Ngay_Dat, 
                        D.Trang_Thai, 
                        ISNULL(T.Trang_Thai, 'Chưa thanh toán') AS Trang_Thai_Thanh_Toan,
                        U.Ho_Ten_User, 
                        STRING_AGG(P.Ten_Product, ', ') AS Danh_Sach_San_Pham,
                        STRING_AGG(CAST(P.Gia AS NVARCHAR), ', ') AS Don_Gia,
                        STRING_AGG(CAST(C.So_Luong AS NVARCHAR), ', ') AS So_Luong_Moi_SP,
                        D.Tong_Gia
                    FROM DonHang D
                    JOIN USERS U ON D.Userid = U.User_id
                    JOIN ChiTietDonHang C ON D.Order_id = C.Orderid
                    JOIN Products P ON C.Productid = P.Product_id
                    LEFT JOIN ThanhToan T ON D.Order_id = T.Orderid
                    GROUP BY D.Order_id, D.Ngay_Dat, D.Trang_Thai, T.Trang_Thai, U.Ho_Ten_User, D.Tong_Gia
                    ORDER BY D.Order_id DESC`);
        return result.recordset;
    } catch (error) {
        console.log(error);
    }
}

exports.UpdateOrderStatus = async (orderId , newStatus) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Order_id', sql.Int, orderId)
            .input('Trang_Thai', sql.NVarChar, newStatus)
            .query(`UPDATE DonHang SET Trang_Thai = @Trang_Thai WHERE Order_id = @Order_id`);
        return true;
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.UpdateQualityProductAdd = async (Orderid) => {
    try {
        const pool = await sql.connect(DB);
        const orderDetails = await pool.request()
            .input('Orderid', sql.Int, Orderid)
            .query(`
                SELECT Productid, So_Luong FROM ChiTietDonHang 
                WHERE Orderid = @Orderid
            `);
        for (const detail of orderDetails.recordset) {
            await pool.request()
                .input('Product_id', sql.Char, detail.Productid)
                .input('So_Luong', sql.Int, detail.So_Luong)
                .query(`
                    UPDATE Products 
                    SET So_Luong = So_Luong + @So_Luong
                    WHERE Product_id = @Product_id
                `);
        }
    } catch (error) {
        console.log(error)
    }
}

exports.UpdatePaymentStatus = async (Orderid) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Orderid', sql.Int, Orderid)
            .input('Trang_Thai', sql.NVarChar, "Đã thanh toán")
            .query(`UPDATE ThanhToan SET Trang_Thai = @Trang_Thai WHERE Orderid = @Orderid`);
        return true;
    } catch (error) {
        console.log(error)
        return false
    }
}

exports.DelOrder = async(Orderid)=> {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Order_id',sql.Int,Orderid)
            .query('Delete from DonHang where Order_id = @Order_id');
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
}

exports.UpdateSoLuong = async(productId,quantity) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool
            .request()
            .input('Product_id', sql.Char, productId)
            .input('quantity', sql.Int , quantity)
            .query(`
                UPDATE Products
                SET 
                    So_Luong = So_Luong - @quantity,
                    So_Luong_Ban = So_Luong_Ban + @quantity
                WHERE Product_id = @Product_id
            `)
    } catch (error) {
        console.log(error)
    }
}

exports.GetCartItemById = async (Cart_id) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Cart_id', sql.Int, Cart_id)
            .query('SELECT * FROM Cart WHERE Cart_id = @Cart_id');
        return result.recordset[0];
    } catch (error) {
        console.log(error)
    }
};

exports.UpdateCartItemQuantity = async (Cart_id, So_Luong) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Cart_id', sql.Int, Cart_id)
            .input('So_Luong', sql.Int, So_Luong)
            .query('UPDATE Cart SET So_Luong = @So_Luong WHERE Cart_id = @Cart_id');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

exports.getTotalProducts = async () => {
    const pool = await sql.connect(DB);
    const result = await pool.request()
        .query(`SELECT COUNT(*) AS total FROM Products`);
    return result.recordset[0].total;
};

exports.getPaginatedProducts = async (limit, offset) => {
    const pool = await sql.connect(DB);
    const result = await pool.request()
        .query(`SELECT * FROM Products ORDER BY Product_id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);
    return result.recordset;
};

exports.getTotalProductsbykey = async (keyword) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Keyword',sql.NVarChar,`%${keyword}%`)
            .query(`SELECT COUNT(*) AS total FROM Products where Ten_Product like @Keyword`);
        return result.recordset[0].total;
    } catch (error) {
        console.log(error)
    }
};

exports.getPaginatedProductsbykey = async (limit, offset,keyword) => {
    try {
        const pool = await sql.connect(DB);
        const result = await pool.request()
            .input('Keyword',sql.NVarChar,`%${keyword}%`)
            .query(`SELECT * FROM Products Where Ten_Product like @Keyword  ORDER BY Product_id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);
        return result.recordset;
    } catch (error) {
        console.log(error)
    }
};

exports.getTotalProductsinCata = async (Cataid) => {
    const pool = await sql.connect(DB);
    const result = await pool.request()
        .input('Danh_Muc_id',sql.Char,Cataid)
        .query(`SELECT COUNT(*) AS total FROM Products where Danh_Muc_id = @Danh_Muc_id`);
    return result.recordset[0].total;
};

exports.getPaginatedProductsbyCataid = async (limit, offset,Cataid) => {
    const pool = await sql.connect(DB);
    const result = await pool.request()
        .input('Danh_Muc_id',sql.Char,Cataid)
        .query(`SELECT * FROM Products Where Danh_Muc_id = @Danh_Muc_id  ORDER BY Product_id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);
    return result.recordset;
};
