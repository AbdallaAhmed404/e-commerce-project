const express = require('express')
const UserRouter = express.Router()
const authorized = require('../middlewares/Authorized')
const { signin, login,forgetpassword,resetPassword, AllProduct, addToCart, ShowCart, DeleteProduct,
        UpdateProduct, VerifyOrder, CancelOrder,updateProfile,getProductsByCategory,getProductById } = require('../controllers/UserController')


UserRouter.post('/signin', signin);
UserRouter.post('/login', login);
UserRouter.post('/forgetpassword', forgetpassword);
UserRouter.post('/resetPassword', resetPassword);


UserRouter.get('/allproduct', AllProduct); 
UserRouter.get('/product/:id', getProductById);
UserRouter.get('/category/:category', getProductsByCategory);


UserRouter.post('/addtocart/:id', authorized, addToCart);
UserRouter.get('/ShowCart/:id', authorized, ShowCart);
UserRouter.delete('/deleteproduct/:id', authorized, DeleteProduct);
UserRouter.put('/updateproduct/:id', authorized, UpdateProduct);


UserRouter.put('/verify/:id', authorized, VerifyOrder);
UserRouter.put('/cancel/:id', authorized, CancelOrder);


UserRouter.put('/updateprofile/:id', authorized, updateProfile);


module.exports = UserRouter;











