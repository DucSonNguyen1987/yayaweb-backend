const mongoose = require("mongoose");

// Sous-schéma pour le produit dans un pack
const productSchema = mongoose.Schema({
    productId: String,
    name: String,
    price: Number,
    quantity: Number
});

const compositionSchema = mongoose.Schema({
    name: String,
    percentage: Number
});


// Schéma pour le pack
const packSchema = mongoose.Schema({
    packId: String,
    name: String,
    description: String,
    volume: {
        type: String,
        enum: ['20ml','250ml','1l'], 
    },
    price: Number,
    ccomposition: [compositionSchema],
    images: [String]
});

const Pack = mongoose.model("packs", packSchema);
module.exports = Pack;
