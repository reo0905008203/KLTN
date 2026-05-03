const express = require('express')
const router = express.Router()
const CC = require('../Controllers/ChatControllers')

// API endpoints
router.post('/send', CC.SendMessage)
router.get('/messages', CC.GetMessages)
router.get('/unread', CC.GetUnreadCount)
router.get('/users', CC.GetChatUsers)

module.exports = router
