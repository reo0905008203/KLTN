const sql = require('mssql')
const DB = require('../Config/ConnectDB')
const moment = require('moment-timezone');
const GetDate = moment.tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD HH:mm:ss');

// Lấy tất cả tin nhắn giữa 2 user
exports.GetMessages = async (fromUser, toUser) => {
    try {
        const pool = await sql.connect(DB);
        const fromUserPadded = fromUser.trim().padEnd(10, ' ');
        const toUserPadded = toUser.trim().padEnd(10, ' ');
        
        const result = await pool
            .request()
            .input('From_User', sql.Char(10), fromUserPadded)
            .input('To_User', sql.Char(10), toUserPadded)
            .query(`
                SELECT c.*, u1.Ho_Ten_User as From_Name, u2.Ho_Ten_User as To_Name
                FROM Chat c
                LEFT JOIN USERS u1 ON RTRIM(c.From_User) = RTRIM(u1.User_id)
                LEFT JOIN USERS u2 ON RTRIM(c.To_User) = RTRIM(u2.User_id)
                WHERE (
                    (RTRIM(c.From_User) = RTRIM(@From_User) AND RTRIM(c.To_User) = RTRIM(@To_User))
                    OR (RTRIM(c.From_User) = RTRIM(@To_User) AND RTRIM(c.To_User) = RTRIM(@From_User))
                )
                ORDER BY c.Ngay_Gui ASC
            `);
        return result.recordset;
    } catch (error) {
        console.log('GetMessages error:', error);
        return [];
    }
}

// Gửi tin nhắn mới
exports.SendMessage = async (fromUser, toUser, message, isAdmin = false) => {
    try {
        const pool = await sql.connect(DB);
        const fromUserPadded = fromUser.trim().padEnd(10, ' ');
        const toUserPadded = toUser.trim().padEnd(10, ' ');
        
        await pool
            .request()
            .input('From_User', sql.Char(10), fromUserPadded)
            .input('To_User', sql.Char(10), toUserPadded)
            .input('Message', sql.NVarChar(500), message)
            .input('Ngay_Gui', sql.DateTime, GetDate)
            .input('Is_Admin', sql.Bit, isAdmin)
            .query(`
                INSERT INTO Chat (From_User, To_User, Message, Ngay_Gui, Is_Admin)
                VALUES (@From_User, @To_User, @Message, @Ngay_Gui, @Is_Admin)
            `);
        return true;
    } catch (error) {
        console.log('SendMessage error:', error);
        return false;
    }
}

// Đánh dấu tin nhắn đã đọc
exports.MarkAsRead = async (fromUser, toUser) => {
    try {
        const pool = await sql.connect(DB);
        const fromUserPadded = fromUser.trim().padEnd(10, ' ');
        const toUserPadded = toUser.trim().padEnd(10, ' ');
        
        await pool
            .request()
            .input('From_User', sql.Char(10), fromUserPadded)
            .input('To_User', sql.Char(10), toUserPadded)
            .query(`
                UPDATE Chat 
                SET Is_Read = 1 
                WHERE RTRIM(From_User) = RTRIM(@From_User) AND RTRIM(To_User) = RTRIM(@To_User) AND Is_Read = 0
            `);
        return true;
    } catch (error) {
        console.log('MarkAsRead error:', error);
        return false;
    }
}

// Đếm số tin nhắn chưa đọc
exports.GetUnreadCount = async (userId) => {
    try {
        const pool = await sql.connect(DB);
        const userIdPadded = userId.trim().padEnd(10, ' ');
        const result = await pool
            .request()
            .input('To_User', sql.Char(10), userIdPadded)
            .query(`
                SELECT COUNT(*) as UnreadCount
                FROM Chat
                WHERE RTRIM(To_User) = RTRIM(@To_User) AND Is_Read = 0
            `);
        return result.recordset[0].UnreadCount || 0;
    } catch (error) {
        console.log('GetUnreadCount error:', error);
        return 0;
    }
}

// Lấy danh sách user đã chat với admin
exports.GetChatUsersForAdmin = async () => {
    try {
        const pool = await sql.connect(DB);
        const adminPadded = 'admin'.padEnd(10, ' ');
        const result = await pool
            .request()
            .input('Admin', sql.Char(10), adminPadded)
            .query(`
                SELECT DISTINCT 
                    u.User_id,
                    u.Ho_Ten_User,
                    u.Phone,
                    (SELECT COUNT(*) FROM Chat WHERE RTRIM(To_User) = RTRIM(@Admin) AND RTRIM(From_User) = RTRIM(u.User_id) AND Is_Read = 0) as UnreadCount,
                    (SELECT TOP 1 Message FROM Chat WHERE (RTRIM(From_User) = RTRIM(u.User_id) OR RTRIM(To_User) = RTRIM(u.User_id)) ORDER BY Ngay_Gui DESC) as LastMessage,
                    (SELECT TOP 1 Ngay_Gui FROM Chat WHERE (RTRIM(From_User) = RTRIM(u.User_id) OR RTRIM(To_User) = RTRIM(u.User_id)) ORDER BY Ngay_Gui DESC) as LastMessageTime
                FROM USERS u
                INNER JOIN Chat c ON (RTRIM(c.From_User) = RTRIM(u.User_id) OR RTRIM(c.To_User) = RTRIM(u.User_id))
                WHERE u.Quyen_han = 0 AND RTRIM(u.User_id) != RTRIM(@Admin)
                GROUP BY u.User_id, u.Ho_Ten_User, u.Phone
                ORDER BY LastMessageTime DESC
            `);
        return result.recordset;
    } catch (error) {
        console.log('GetChatUsersForAdmin error:', error);
        return [];
    }
}
