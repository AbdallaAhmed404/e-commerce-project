const mongoose = require('mongoose')
const __ = require('lodash')

const ProductSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        title: { type: String },
        rate: { type: String },
        photo: { type: String },
        discount: { type: String, default: 0 },
        soldCount: { type: Number, default: 0 },
        description: { type: String },
        category: { type: String, enum: ['fruit', 'other', 'vegetables', 'meat'], required: true }

    }, {
    toJSON: {
        transform: (doc, ret) => {
            return __.omit(ret, ['__v']);
        }
    }
})



const ProductModel = mongoose.model('Product', ProductSchema)
module.exports = ProductModel;

