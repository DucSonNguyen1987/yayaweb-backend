var express = require('express');
var router = express.Router();

require('../models/connection');
const Ingredient = require('../models/ingredients');


//GET ingredient info
router.get('/ingredient-info/:slug', function(req,res){
    console.log(req.params.slug)
    // find ingredient in DB
    Ingredient.findOne({name: req.params.slug}).then (data=>{
        if(data===null){
            res.json({result: false, error:'Ingredient not found'});
        }else {
            // send Ingredient data
            res.json({result: true, ingredient: data});
        }
    });

});


//Get all ingredients
router.get('/', function(req,res){
    Ingredient.find().then (data =>{
        if(data===null){
            res.json({result: false, error:'No Ingredient found'});
    } else {
        res.json({result: true, ingredients : data})
    }

})
})





// add ingredient

router.post('/ingredient-add/', function(req, res){
    const  {name, dosage, color, price, benefits }= req.body;

    //Check if Ingredient with same id already exists
    Ingredient.findOne({id: req.params.name}).then(data=>{
        if (data ===null) {
            // creat a new ingredient doc
            const ingredientData = {name, dosage, color, price, benefits }
            const newIngredient = new Ingredient(ingredientData);

            // save new Ingredeient in DB
            newIngredient.save().then( newDoc =>{
                res.json({result : true, data : newDoc});
            });
        } else {
            //Ingredient already exists
            res.json({result: false, error:'Ingredient already exists'});
        }
    });

});

module.exports = router;