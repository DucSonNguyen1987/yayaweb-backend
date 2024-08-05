const mongoose = require("mongoose");


const addressSchema = mongoose.Schema({
    streetNumber: String,
    streetName: String,
    city: String,
    zipCode: Number,
    billing: Boolean,
    instruction:String,
});


const subscriptionSchema = mongoose.Schema({
    subscribed:Boolean,
    subscriptionType: {
        type: String,
        enum: ['Lonely Wolf', 'Duo', 'Family'], 
    },
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['En cours','En pause', 'Désabonné'], 
    },
});


const depositSchema = mongoose.Schema({
    credit: Number,
    deliverable: Boolean
});

const userSchema = mongoose.Schema({
    lastName:String,
    firstName: String,
    age:Number,
    gender:String,
    email:String,
    phone:String,
    password: String,
    token : String,
    address: [addressSchema],       
    subscription: [subscriptionSchema],  
    deposit: [depositSchema],
    status: {
        type: String,
        enum: ['admin','client'], 
    },   
})

const User = mongoose.model("users", userSchema)
module.exports = User;