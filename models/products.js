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
        length: { type: Number },
        breadth: { type: Number },
        height: { type: Number }
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