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
        enum: ['Super Jus', 'Infusions', 'Super Shots', 'MYJUICE'], 
    },
    volumes: [Object],
    bottle: {
        type: String,
        enum: ['Verre','PET'], 
    },
    description: String,
    price: Number,
    composition: [compositionSchema],
    images: [String],
    nutritionalInfo: [nutritionInfoSchema]
});

// set volumes available depending on category
productSchema.pre('save', function(next){
    if(this.category === 'Super Shots') this.volumes = [{capacity: '20ml', price: 0}];
    else this.volumes = [{capacity: '250ml', price: 0}, {capacity:'1l', price: 3}];
    next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
