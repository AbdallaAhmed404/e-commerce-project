const express = require('express')
const AdminRouter = express.Router()
const isAdmin = require('../middlewares/isAdmin');
const { AllUsers, DelUser, AddProduct, AllProduct, UpdateProduct, DeleteProduct,adminLogin } = require('../controllers/AdminController')

AdminRouter.post('/login', adminLogin);

AdminRouter.get('/AllUsers',isAdmin, AllUsers);

AdminRouter.delete('/deluser',isAdmin, DelUser);

AdminRouter.post('/addproduct',isAdmin, AddProduct);

AdminRouter.get('/allproduct',isAdmin, AllProduct);

AdminRouter.patch('/updateproduct',isAdmin, UpdateProduct);

AdminRouter.delete('/delproduct',isAdmin, DeleteProduct);


module.exports = AdminRouter

