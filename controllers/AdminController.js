const UserModel = require('../models/UserModel')
const ProductModel = require("../models/ProductModel")
const AdminModel = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const customError = require('../customError');
const jwt = require('jsonwebtoken');

const adminRegister = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const exists = await AdminModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const newAdmin = new AdminModel({ email, password });
        await newAdmin.save();

        res.status(201).json({
            message: "Admin registered successfully",
        });

    } catch (err) {
        console.error("Admin register error:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to register admin"
        }));
    }
};

const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const admin = await AdminModel.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        if (password !== admin.password) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
}

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'key');
        res.status(200).json({ message: 'Admin logged in successfully', token });
    } catch (err) {
        return next(customError({
            statusCode: 500,
            message: "Failed to login admin"
        }));
    }
};

const updateAdminPassword = async (req, res, next) => {
    try {
        const adminId = "686ed1d29b55b078c1ffbcd3"; 
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const admin = await AdminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Error updating admin password:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to update admin password"
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
        const id = req.body.id;
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

const getProductsSortedBySoldCount = async (req, res, next) => {
    try {
        const sortedProducts = await ProductModel.find({}).sort({ soldCount: -1 });
        res.status(200).json(sortedProducts);
    } catch (err) {
        console.error("Error sorting products:", err);
        return next(customError({
            statusCode: 500,
            message: "Failed to sort products"
        }));
    }
};

module.exports = {
    adminRegister,
    adminLogin,
    updateAdminPassword,
    AllUsers,
    DelUser,
    AddProduct,
    AllProduct,
    UpdateProduct,
    DeleteProduct,
    getProductsSortedBySoldCount
};