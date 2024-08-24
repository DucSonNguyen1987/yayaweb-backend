const mongoose = require("mongoose");


const benefitsSchema = mongoose.Schema({
    benefit1: String,
    benetit2: String,
    benefit3: String,
});



const ingredientSchema = mongoose.Schema({
    name: String,
    dosage: Number,
    color: String,
    percentage: Number,
    price: Number,
    benefits : [benefitsSchema],
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
module.exports = Ingredient;