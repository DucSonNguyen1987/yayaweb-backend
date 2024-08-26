const mongoose = require("mongoose");


// const benefitsSchema = mongoose.Schema({
//     benefit1: String,
//     benetit2: String,
//     benefit3: String,
// });



const ingredientSchema = mongoose.Schema({
    name: String,
    type: String,
    dosage: Number,
    color: String,
    // percentage: Number,
    price: Number,
    benefits : [String],
});

const Ingredient = mongoose.model("ingredients", ingredientSchema);
module.exports = Ingredient;