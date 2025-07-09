const express = require('express')
const AdminRouter = express.Router()
const isAdmin = require('../middlewares/isAdmin');
const { adminRegister,updateAdminPassword,AllUsers, DelUser, AddProduct, AllProduct, 
        UpdateProduct, DeleteProduct,adminLogin,getProductsSortedBySoldCount } = require('../controllers/AdminController')

AdminRouter.post('/register', adminRegister);

AdminRouter.post('/login', adminLogin);

AdminRouter.put('/updatepassword', updateAdminPassword);

AdminRouter.get('/AllUsers',isAdmin, AllUsers);

AdminRouter.delete('/deluser',isAdmin, DelUser);

AdminRouter.post('/addproduct',isAdmin, AddProduct);

AdminRouter.get('/allproduct',isAdmin, AllProduct);

AdminRouter.patch('/updateproduct',isAdmin, UpdateProduct);

AdminRouter.delete('/delproduct',isAdmin, DeleteProduct);

AdminRouter.get('/soldcount', getProductsSortedBySoldCount);


module.exports = AdminRouter

