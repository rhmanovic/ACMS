

function buildUpdateOneWriteOperations(productIDs, warehouse, quantity) {

  const writeOperations = productIDs.map((productID, index) => (
    {
      updateOne: {
        filter: { _id: productID },
        update: { $inc: { [warehouse]: -quantity[index], quantity: -quantity[index] } }
      }
  }));
  return writeOperations;
}


var writeOperations = buildUpdateOneWriteOperations(orderData.productIDs, orderData.warehouse, orderData.quantity)


try {
  Order.bulkWrite(writeOperations).then(function() {
    res.redirect('back')
  })
} catch (error) {
  print(error)
}
