const model = require('../models/UserModel')
const ProductModel = require("../models/ProductModel")
const CartModel = require('../models/CartModel')
const customError = require('../customError')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');

const signin = async (req, res, next) => {
    try {
        const newUser = await model({
            Name: req.body.Name,
            email: req.body.email,
            password: req.body.password,
            mobile: req.body.mobile
        })
        // const exists = await model.findOne({ email });
        // if (exists) return next(customError({ statusCode: 400, message: 'Email already exists' }));
        const token = await newUser.generatetoken()
        await newUser.save();
        res.status(200).json({ message: "successful", token: token });
    } catch (err) {
        console.error("Error during signin:", err);
        return next(customError({
            status: 500,
            message: "Failed to create new user account"
        }))
    }
}

const login = async (req, res, next) => {
    try {
        const user = await model.findOne({ email: req.body.email })
        if (!user) return res.status(404).send("user not found")
        const isValidPassword = await bcrypt.compare(req.body.password, user.password)
        if (!isValidPassword) return res.status(400).send("invalid password")
        const token = await user.generatetoken();
        res.status(200).json({ userID:user._id, token: token });
    } catch (err) {
        console.error("Login error:", err);
        return next(customError({
            statusCode: 500,
            message: "Login failed due to internal error"
        }))
    }
}


const forgetpassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await model.findOne({ email });
        if (!user) return next(customError({ statusCode: 404, message: "User not found" }));

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = code;
        await user.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abdallaahmedgym@gmail.com',
                pass: 'suwz vxbk fvdi fxpq'
            }
        });

        await transporter.sendMail({
            from: 'abdallaahmedgym@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your reset code is: ${code}`
        });

        res.json({ message: "Reset code sent to email" });
    } catch (err) {
        console.error(err);
        next(customError({ statusCode: 500, message: "Error sending reset code" }));
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, code, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await model.findOne({ email, resetCode: code });
        if (!user) {
            return res.status(400).json({ message: "Invalid code" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (err) {
        console.error(err);
        next(customError({ statusCode: 500, message: "Error resetting password" }));
    }
};


const AllProduct = async (req, res, next) => {
    try {
        const products = await ProductModel.find({});
        res.json(products);
    } catch (err) {
        console.error("Error retrieving products:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to retrieve products"
        }))
    }
}

const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.params.id;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.soldCount += 1;
        await product.save();
        let cart = await CartModel.findOne({ userId: userId });
        if (!cart) {
            cart = new CartModel({
                userId: userId,
                products: [{ productId: productId, quantity: 1 }]
            });
        } else {
            const productIndex = cart.products.findIndex(
                item => item.productId.toString() === productId.toString()
            );
            if (productIndex > -1) { 
                cart.products[productIndex].quantity += 1;
            } else { 
                cart.products.push({ productId: productId, quantity: 1 });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        console.error("Add to cart error:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to add product to cart"
        }));
    }
};


const ShowCart = async (req, res, next) => {
    try {
        const userid = req.params.id
        const cart = await CartModel.findOne({ userId: userid }).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.json(cart.products);
    } catch (err) {
        console.error("Show cart error:", err);
        return next(customError({
            status: 500,
            message: "Failed to retrieve cart"
        }))
    }
}

const DeleteProduct = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { productId } = req.body;

       
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        
        const cart = await CartModel.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        
        const productIndex = cart.products.findIndex(
            item => item.productId.toString() === productId.toString()
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);
            await cart.save();
            res.status(200).json({ message: "Product removed from cart", cart: cart });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (err) {
        console.error("Delete product error:", err);
        return next(customError({
            status: 500,
            message: "Failed to delete product from cart"
        }));
    }
};


const UpdateProduct = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { productId, quantity } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const cart = await CartModel.findOne({ userId: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" }); 

        const productIndex = cart.products.findIndex(
            item => item.productId.toString() === productId.toString()
        );

        if (productIndex > -1) {
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.status(200).json({ message: "Quantity updated", cart });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (err) {
        console.error("Update product error:", err);
        return next(customError({
            status: 500,
            message: "Failed to update product in cart"
        }));
    }
};


const VerifyOrder = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const cart = await CartModel.findOne({ userId }).populate('products.productId');
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or not found' });
        }

        const orderDetails = [...cart.products];
        cart.products = [];
        await cart.save();

        res.status(200).json({ message: 'Order verified successfully', orderDetails });
    } catch (err) {
        console.error("Order verification error:", err);
        return next(customError({
            status: 500,
            message: "Internal server error while verifying order"
        }));
    }
};


const CancelOrder = async (req, res, next) => {
    try {
        const userid = req.params.id;
        const cart = await CartModel.findOne({ userId: userid });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or not found' });
        }


        cart.products = [];
        await cart.save();

        res.json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error("Cancel order error:", err);
        return next(customError({
            status: 500,
            message: "Internal server error while cancelling order"
        }));
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { Name, email, currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword) {
            return res.status(400).json({ message: "Current password is required" });
        }
        const user = await model.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        if (newPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }
        const updatedData = {};
        if (Name) updatedData.Name = Name;
        if (email) updatedData.email = email;
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updatedData.password = hashedPassword;
        }
        await model.findByIdAndUpdate(userId, { $set: updatedData }, { new: true });
        res.status(200).json({ message: "Profile updated successfully" });

    } catch (err) {
        console.error("Profile update error:", err);
        return next(customError({
            status: 500,
            message: "Internal server error while updating profile"
        }));
    }
};

const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;

        const products = await ProductModel.find({ category });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found in this category" });
        }

        res.status(200).json(products);
    } catch (err) {
        console.error("Error fetching products by category:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to fetch products by category"
        }));
    }
};
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findOne({ id });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching product by id:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to fetch product by id"
        }));
    }
};



module.exports = {
    signin,
    login,
    AllProduct,
    addToCart,
    ShowCart,
    DeleteProduct,
    UpdateProduct,
    VerifyOrder,
    CancelOrder,
    updateProfile,
    forgetpassword,
    resetPassword,
    getProductsByCategory,
    getProductById
}
