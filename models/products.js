const mongoose = require("mongoose");

const compositionSchema = mongoose.Schema({
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
    name: String,
    percentage: Number
});

const nutritionInfoSchema = mongoose.Schema({
    calories: Number,
    fat: Number,
    protein: Number,
    suger: Number
});

const imageSchema = mongoose.Schema({
    url: String,
    description: String,
    productOptions: Object,
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
    images: [imageSchema],
    nutritionalInfo: [nutritionInfoSchema]
});

// set volumes available depending on category
productSchema.pre('save', function(next){
    if(this.category === 'Super Shots') this.volumes = [{capacity: '60ml', priceMultipier: 1}];
    else this.volumes = [{capacity: '250ml', priceMultipier: 1}, {capacity:'1l', priceMultipier: 3}];
    next();
});

const Product = mongoose.model("products", productSchema);
module.exports = Product;
