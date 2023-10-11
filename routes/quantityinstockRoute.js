const router = require("express").Router();
const quantityInStockController = require('../controllers/quantityInStock');

router.route("/")
    .get(async (req, res) => {
        try {
            const quantityInStock = await quantityInStockController.calculateQuantityInStock();

            const filteredQuantityInStock = quantityInStock.filter(item =>
                (item.quantity !== 0 || item.quantity === null) 
    
            );

            res.json({ quantityInStock: filteredQuantityInStock });
        } catch (error) {
            console.error('Error in quantityInStock route:', error);
            res.status(500).json({ error: 'Error calculating quantity in stock' });
        }
    })
    router.route("/a")
    .get(async(req,res)=>{
        try {
            const productQuantitiesInTunisia = await quantityInStockController.compareQuantityInTunisia();
            res.json(productQuantitiesInTunisia);
          } catch (error) {
            res.status(500).json({ error: 'Error comparing quantity in Tunisia' });
          }
        });

module.exports = router;



