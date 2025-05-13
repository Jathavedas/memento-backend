const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String], 
        required: true
    },
    size: {
        length: { type: Number, required: true },
        breadth: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    type: {
        type: String,
        enum: ['small', 'medium', 'large','nil'], 
        default: 'nil'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true }); 

const Product = mongoose.model('Product', productSchema);

module.exports = Product;