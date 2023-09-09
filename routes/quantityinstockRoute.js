const router = require("express").Router();
const quantityInStockController = require('../controllers/quantityInStock');
const QuantityInStock = require('../models/quantityInStock'); 

router.route("/")
    .get(async (req, res) => {
        try {
            const quantityInStock = await quantityInStockController.calculateQuantityInStock();
            res.json({ quantityInStock });
        } catch (error) {
            console.error('Error in quantityInStock route:', error);
            res.status(500).json({ error: 'Error calculating quantity in stock' });
        }
    });
    
      

module.exports = router;

