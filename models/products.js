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
    volumes: [String],
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
    if(this.category === 'Super Shots') this.volumes = ['20ml'];
    else this.volumes = ['250ml','1l'];
    next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
