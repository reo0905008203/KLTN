const sql = require('mssql')

// Cấu hình kết nối SQL Server
const dbConfig = {
    user: 'sa',
    password: '123',
    server: 'DESKTOP-ERSE5TK',
    database: 'PCShop',
    port: 1433, // Chỉ định port cụ thể
    options: {
        trustServerCertificate: true,
        encrypt: false, // Tắt encrypt để tránh lỗi socket
        enableArithAbort: true,
        connectTimeout: 60000,
        requestTimeout: 60000
        // Bỏ instanceName - không cần nếu là default instance hoặc đã chỉ định port
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

// Thử kết nối nhưng không block nếu lỗi
sql.connect(dbConfig).then(() => {
    console.log("Database Connected Successfully");
}).catch(err => {
    console.log('Database connection error:', err.message);
    console.log('Vui lòng kiểm tra:');
    console.log('1. SQL Server đang chạy');
    console.log('2. Tên server đúng: DESKTOP-ERSE5TK');
    console.log('3. Database PCShop đã được tạo');
    console.log('4. Tài khoản sa có quyền truy cập');
    console.log('5. SQL Server Browser service đang chạy');
    console.log('6. Firewall cho phép kết nối port 1433');
});

module.exports = dbConfig;
