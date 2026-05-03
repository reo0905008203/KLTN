const sql = require('mssql')
const DB = require('../Config/ConnectDB')
const ChatModel = require('../Models/ChatModels')

const ADMIN_USER_ID = 'admin'

function isAdminRole(user) {
    return user && (user.Quyen_han === true || user.Quyen_han === 1)
}

function chatViewerId(user) {
    if (isAdminRole(user)) return ADMIN_USER_ID
    return String(user.User_id || '').trim()
}

/**
 * Khách hỏi mua / tư vấn / giới thiệu và có nhắc linh kiện (CPU, VGA, main, màn hình, loa, PC…)
 */
function shouldRunProductChatbot(text) {
    const t = String(text || '').toLowerCase()
    const shopping =
        /mua|đặt\s*hàng|đặt hàng|cần\s*mua|muốn\s*mua|mình\s*muốn|cho\s*mình|cho\s+xem|tư\s*vấn|giới\s*thiệu|gợi\s*ý|hỏi\s*giá|giá\s*b|bao\s*nhiêu|còn\s*hàng|tìm\s*sp|sản\s*phẩm|linh\s*kiện|đề\s*xuất|mua\s*giúp|cần\s*xem|đang\s*tìm/i.test(
            t
        )
    const hardware =
        /\bcpu\b|processor|bộ\s*xử\s*lý|vga|gpu|rtx|gtx|\bmain\b|mainboard|bo\s*mạch|motherboard|màn\s*hình|monitor|\bmh\b|\bloa\b|\bpc\b|máy\s*tính|case|nguồn|psu|\bram\b|ssd|hdd|ổ\s*cứng|chipset|b760|b660|z790|am4|am5/i.test(
            t
        )
    return shopping && hardware
}

function extractKeywords(text) {
    if (!text) return []
    const cleaned = String(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
    const tokens = cleaned
        .split(/\s+/g)
        .map((x) => x.trim())
        .filter((x) => x.length >= 2)

    const stop = new Set([
        'mua', 'ban', 'cho', 'toi', 'tôi', 'minh', 'mình', 'can', 'cần', 'muon', 'muốn', 'xin',
        'hay', 'hãy', 'giup', 'giúp', 've', 'về', 'sp', 'san', 'sản', 'pham', 'phẩm', 'gia',
        'giá', 'co', 'có', 'khong', 'không', 'nhu', 'nhu', 'cau', 'cầu', 'hoi', 'hỏi', 'xin',
        'voi', 'với', 'là', 'va', 'và', 'mot', 'một', 'vai', 'vài', 'nao', 'nào', 'duoc', 'được'
    ])

    const out = []
    const seen = new Set()
    for (const w of tokens) {
        if (stop.has(w)) continue
        if (seen.has(w)) continue
        seen.add(w)
        out.push(w)
        if (out.length >= 10) break
    }
    return out
}

async function findProductsInStock(keywords, pool) {
    if (!keywords.length) return []

    const request = pool.request()
    const orParts = []
    for (let i = 0; i < keywords.length; i++) {
        const k = keywords[i]
        request.input(`k${i}`, sql.NVarChar, `%${k}%`)
        orParts.push(`(Ten_Product LIKE @k${i} OR Mo_Ta_Product LIKE @k${i})`)
    }

    const query = `
        SELECT TOP 5 Product_id, Ten_Product, Gia, So_Luong
        FROM Products
        WHERE (${orParts.join(' OR ')})
          AND ISNULL(So_Luong, 0) > 0
        ORDER BY Gia DESC
    `
    const result = await request.query(query)
    return result.recordset || []
}

function buildBotReplySnippet(userMessage, products) {
    const shortQ = String(userMessage || '').trim().slice(0, 120)
    if (!products.length) {
        return `Shop chưa có hàng trong kho khớp với: "${shortQ}". Bạn ghi rõ model (vd: RTX 4060, màn 24", main B760) hoặc đợi admin tư vấn.`
    }
    const lines = products.map((p, idx) => {
        const price = p.Gia != null ? `${Number(p.Gia).toLocaleString('vi-VN')}` : '0'
        const stock = p.So_Luong != null ? p.So_Luong : '0'
        return `${idx + 1}) ${p.Ten_Product} — ${price}đ — còn ${stock}`
    })
    return (
        `Chào bạn! Một số sản phẩm đang còn trong kho phù hợp:\n${lines.join('\n')}\n` +
        `Vào trang sản phẩm để xem chi tiết hoặc nhắn admin để đặt hàng.`
    )
}

// API: Gửi tin nhắn
exports.SendMessage = async (req, res) => {
    try {
        const user = req.session.user
        if (!user) {
            return res.json({ success: false, message: 'Chưa đăng nhập' })
        }

        const { toUser, message } = req.body
        if (!message || !message.trim()) {
            return res.json({ success: false, message: 'Tin nhắn không được để trống' })
        }

        const isAd = isAdminRole(user)
        const toTrim = String(toUser || '').trim()
        const msgTrim = message.trim()

        let fromId = String(user.User_id || '').trim()
        if (isAd && toTrim !== ADMIN_USER_ID) {
            fromId = ADMIN_USER_ID
        }

        const result = await ChatModel.SendMessage(fromId, toTrim, msgTrim, isAd)

        if (result && !isAd && toTrim === ADMIN_USER_ID && shouldRunProductChatbot(msgTrim)) {
            try {
                const pool = await sql.connect(DB)
                const keywords = extractKeywords(msgTrim)
                const products = await findProductsInStock(keywords, pool)
                let reply = buildBotReplySnippet(msgTrim, products)
                if (reply.length > 480) reply = reply.slice(0, 477) + '...'
                await ChatModel.SendMessage(ADMIN_USER_ID, fromId, `BOT: ${reply}`, true)
            } catch (e) {
                console.log('Chatbot product reply error:', e)
            }
        }

        if (result) {
            res.json({ success: true, message: 'Gửi tin nhắn thành công' })
        } else {
            res.json({ success: false, message: 'Gửi tin nhắn thất bại' })
        }
    } catch (error) {
        console.log('SendMessage error:', error)
        res.json({ success: false, message: 'Lỗi server' })
    }
}

// API: Lấy tin nhắn
exports.GetMessages = async (req, res) => {
    try {
        const user = req.session.user
        if (!user) {
            return res.json({ success: false, messages: [] })
        }

        const { toUser } = req.query
        const viewerId = chatViewerId(user)
        const otherId = String(toUser || '').trim()
        const messages = await ChatModel.GetMessages(viewerId, otherId)

        await ChatModel.MarkAsRead(otherId, viewerId)

        res.json({ success: true, messages: messages || [] })
    } catch (error) {
        console.log('GetMessages API error:', error)
        res.json({ success: false, messages: [] })
    }
}

// API: Lấy số tin nhắn chưa đọc
exports.GetUnreadCount = async (req, res) => {
    try {
        const user = req.session.user
        if (!user) {
            return res.json({ count: 0 })
        }

        const count = await ChatModel.GetUnreadCount(chatViewerId(user))
        res.json({ count: count })
    } catch (error) {
        console.log('GetUnreadCount error:', error)
        res.json({ count: 0 })
    }
}

// API: Lấy danh sách user cho admin
exports.GetChatUsers = async (req, res) => {
    try {
        const user = req.session.user
        if (!user || !isAdminRole(user)) {
            return res.json({ success: false, users: [] })
        }

        const users = await ChatModel.GetChatUsersForAdmin()
        res.json({ success: true, users: users || [] })
    } catch (error) {
        console.log('GetChatUsers error:', error)
        res.json({ success: false, users: [] })
    }
}
