const mongoose = require("mongoose");

// Sous-schéma pour le produit dans une commande
const productSchema = mongoose.Schema({
    productId: String,
    name: String,
    price: Number,
    quantity: Number
});

// Schéma pour la commande
const orderSchema = mongoose.Schema({
    orderId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Shipped', 'Delivered', 'Cancelled'], 
    },
    products: [productSchema], 
    delivryDate:Date,
    totalAmount: Number,
    shippingAddress: {
        streetNumber: String,
        streetName: String,
        city: String,
        zipCode: Number,
        billing: Boolean,
        instruction:String
    },
    credit: Number
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
