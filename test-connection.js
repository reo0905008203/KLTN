const sql = require('mssql')

// Thử các cấu hình khác nhau
const configs = [
    {
        name: 'localhost (no encrypt)',
        config: {
            user: 'sa',
            password: '210623',
            server: 'localhost',
            database: 'PCShop',
            options: {
                trustServerCertificate: true,
                encrypt: false,
                enableArithAbort: true
            }
        }
    },
    {
        name: 'DESKTOP-ERSE5TK (no encrypt)',
        config: {
            user: 'sa',
            password: '210623',
            server: 'DESKTOP-ERSE5TK',
            database: 'PCShop',
            options: {
                trustServerCertificate: true,
                encrypt: false,
                enableArithAbort: true
            }
        }
    },
    {
        name: 'localhost (with encrypt)',
        config: {
            user: 'sa',
            password: '210623',
            server: 'localhost',
            database: 'PCShop',
            options: {
                trustServerCertificate: true,
                encrypt: true,
                enableArithAbort: true
            }
        }
    },
    {
        name: 'DESKTOP-ERSE5TK\\MSSQLSERVER',
        config: {
            user: 'sa',
            password: '210623',
            server: 'DESKTOP-ERSE5TK\\MSSQLSERVER',
            database: 'PCShop',
            options: {
                trustServerCertificate: true,
                encrypt: false,
                enableArithAbort: true
            }
        }
    }
]

async function testConnection(config) {
    try {
        console.log(`\nĐang thử: ${config.name}...`);
        const pool = await sql.connect(config.config);
        const result = await pool.request().query('SELECT @@VERSION as Version');
        console.log(`✅ THÀNH CÔNG với: ${config.name}`);
        console.log('SQL Server version:', result.recordset[0].Version.substring(0, 50));
        
        // Test query user
        const userResult = await pool.request()
            .input('User_id', sql.NVarChar(50), 'admin')
            .query('SELECT * FROM USERS WHERE RTRIM(User_id) = @User_id');
        console.log('Test query user "admin":', userResult.recordset.length > 0 ? 'Found' : 'Not found');
        
        await pool.close();
        return config.config;
    } catch (error) {
        console.log(`❌ THẤT BẠI với: ${config.name}`);
        console.log('   Lỗi:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('=== TEST KẾT NỐI SQL SERVER ===\n');
    
    for (const config of configs) {
        const workingConfig = await testConnection(config);
        if (workingConfig) {
            console.log('\n✅ Tìm thấy cấu hình hoạt động!');
            console.log('Cấu hình:', JSON.stringify(workingConfig, null, 2));
            console.log('\nHãy cập nhật ConnectDB.js với cấu hình trên.');
            process.exit(0);
        }
    }
    
    console.log('\n❌ Không tìm thấy cấu hình nào hoạt động!');
    console.log('\nVui lòng kiểm tra:');
    console.log('1. SQL Server đang chạy');
    console.log('2. TCP/IP Protocol được bật trong SQL Server Configuration Manager');
    console.log('3. SQL Server Browser service đang chạy');
    console.log('4. Firewall cho phép port 1433');
    console.log('5. SQL Server cho phép SQL Server Authentication');
    process.exit(1);
}

runTests();
