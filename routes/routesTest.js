var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {

  var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  
  // return res.send('x')
});


router.get( "/completeOrder/:orderId/", mid.requiresSaleseman, function (req, res, next) {
    const { orderId } = req.params;

    Order.findOne({ _id: orderId }).exec(function (error, orderData) {
      if (error) {
        return next(error);
      }

      const updateData = {
        status: "completed",
        totalPrice: orderData.quantity.reduce((total, qty, index) => total + qty * orderData.price[index], 0) - orderData.discount + orderData.shippingCost,
        totalCost: orderData.cost.length === orderData.price.length ? orderData.quantity.reduce((total, qty, index) => total + qty * orderData.cost[index], 0) : orderData.quantity.reduce((total, qty) => total + qty * 0, 0)
      };

      Order.findOneAndUpdate({ _id: orderId }, { $set: updateData }).then(() => {
        const writeOperations = orderData.productIDs.map((productID, index) => ({
          updateOne: {
            filter: { _id: productID },
            update: {
              $inc: {
                [orderData.warehouse]: -orderData.quantity[index],
                quantity: -orderData.quantity[index],
                sellCount: orderData.quantity[index]
              }
            }
          }
        }));

        Product.bulkWrite(writeOperations).then(() => {
          res.redirect("back");
        }).catch((bulkWriteError) => {
          next(bulkWriteError);
        });
      }).catch((updateError) => {
        next(updateError);
      });
    });
  }
);




module.exports = router;