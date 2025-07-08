const UserModel = require('../models/UserModel')
const ProductModel = require("../models/ProductModel")
const customError = require('../customError');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const ADMIN_EMAIL = 'admin@gmail.com';
    const ADMIN_PASSWORD = '123';

    try {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin' }, 'key');

            return res.status(200).json({ message: 'Admin logged in successfully', token });
        } else {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (err) {
        return next(customError({
            statusCode: 500,
            message: "Failed to login admin"
        }));
    }
};

const AllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to retrieve users"
        }))
    }
}

const DelUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await UserModel.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await UserModel.findOneAndDelete({ email: email })
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to delete user"
        }))
    }
}

const AddProduct = async (req, res, next) => {
    try {
        const newProduct = await ProductModel.create({
            id: req.body.id,
            name: req.body.name,
            price: req.body.price,
            title: req.body.title,
            rate: req.body.rate,
            photo: req.body.photo,
            discount: req.body.discount,
            description: req.body.description,
            category: req.body.category
        })
        newProduct.save()
        res.json(newProduct)
    } catch (err) {
        console.error("Error adding product:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to add product"
        }))
    }
}

const AllProduct = async (req, res, next) => {
    try {
        const products = await ProductModel.find({});
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to retrieve products"
        }))
    }
}

const UpdateProduct = async (req, res, next) => {
    try {
        const id = req.body.id;
        const product = await ProductModel.findOne({ id: id });
        if (!product) return res.status(404).send('Product not found')
        product.name = req.body.name;
        product.price = req.body.price;
        product.title = req.body.title;
        product.rate = req.body.rate;
        product.photo = req.body.photo;
        product.discount = req.body.discount;
        product.description = req.body.description;
        product.category = req.body.category;
        await product.save()
        res.json(product);
    } catch (err) {
        console.error("Error updating product:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to update product"

        }))
    }
}

const DeleteProduct = async (req, res, next) => {
    try {
        const id = String(req.body.id);
        const product = await ProductModel.findOne({ id: id });
        console.log(product)
        if (!product) return res.status(404).send('Product not found')
        await ProductModel.findOneAndDelete({ id: id })
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to delete product"
        }))
    }
}

module.exports = {
    adminLogin,
    AllUsers,
    DelUser,
    AddProduct,
    AllProduct,
    UpdateProduct,
    DeleteProduct
};