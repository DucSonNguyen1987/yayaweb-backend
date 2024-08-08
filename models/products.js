const mongoose = require("mongoose");

const compositionSchema = mongoose.Schema({
    name: String,
    percentage: Number
});

const nutritionInfoSchema = mongoose.Schema({
    calories: Number,
    fat: Number,
    protein: Number,
    suger: Number
});

const productSchema = mongoose.Schema({
    productId: String,
    name: String,
    category: {
        type: String,
        enum: ['Super Jus', 'Infusions','Super Shots','MYJUICE'], 
    },
    volum: {
        type: String,
        enum: ['20ml','250ml','1l'], 
    },
    bottle: {
        type: String,
        enum: ['Verre','PET'], 
    },
    descriptino: String,
    price: Number,
    ccomposition: [compositionSchema],
    images: [String],
    nutritionalInfo: [nutritionInfoSchema]
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
