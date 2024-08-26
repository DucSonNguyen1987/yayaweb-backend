const mongoose = require("mongoose");



const ingredientSchema = mongoose.Schema({
    name: String,
    type: String,
    dosage: Number,
    color: String,
    price: Number,
    benefits : [String],
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
module.exports = Ingredient;