const mongoose = require("mongoose");

const compositionSchema = mongoose.Schema({
    name: String,
    percentage: Number
});

// Sous-schéma pour le produit dans une commande
const productSchema = mongoose.Schema({
    // product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productId: String,
    name: String,
    options: Object,
    price: Number,
    quantity: Number,
    category: {
        type: String,
        enum: ['Super Jus', 'Infusions', 'Super Shots', 'MYJUICE'], 
    },
    bottle: {
        type: String,
        enum: ['Verre','PET'], 
    },
    description: String,
    image: String,
    composition: [compositionSchema]
});

const itemSchema = mongoose.Schema({
    product: productSchema,
    quantity: Number,
});


// Schéma pour la commande
const orderSchema = mongoose.Schema({
    orderId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Pending payment', 'Paid', 'Processing', 'Completed', 'Shipped', 'Delivered', 'Canceled', 'Refunded'], 
    },
    items: [itemSchema], 
    deliveryDate: Date,
    totalAmount: Number,
    deliveryAddress: {
        civility: String,
        firstName: String,
        lastName: String,
        streetNumber: String,
        streetName: String,
        city: String,
        zipCode: Number,
        billing: Boolean,
        instructions: String
    },
    credit: Number
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
