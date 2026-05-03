const express = require("express");
const dbConfig = require("./Config/ConnectDB")
const app = express();
const UsersRoutes = require('./routes/UsersRoute')
const AdminRoute = require('./routes/AdminRoute')
const ProductsRoute = require('./routes/ProductsRoute')
const ChatRoute = require('./routes/ChatRoute')
const bodyParser = require('body-parser');
const session = require('express-session')

app.use(session({
    secret: 'pc_shop_secret_key_2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // nếu sử dụng HTTPS, hãy đặt secure: true
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"))

app.use('/', UsersRoutes);
app.use('/admin', AdminRoute);
app.use('/Products', ProductsRoute);
app.use('/api/chat', ChatRoute);

app.get('/login', function (req, res) {
    res.render('login.ejs')
})

app.get('/register', function (req, res) {
    res.render('Register.ejs')
})

app.listen(3003, () => {
    console.log('PC Shop Server running on port 3003')
})
