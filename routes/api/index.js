const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const keys = require("../../config/keys");

const Merchant = require("../../models/merchant");
const Category = require("../../models/category");
const Product = require("../../models/product");
const Branch = require("../../models/branch");
const Customer = require("../../models/customer");
const Order = require("../../models/order");

const axios = require("axios");

router.post("/login", async (req, res) => {
  try {
    const { emailorphone, password } = req.body;
    let merchant;

    // Determine if the identifier is an email or phone number and fetch the merchant
    if (emailorphone.includes("@")) {
      merchant = await Merchant.findOne({ email: emailorphone.toLowerCase() });
    } else {
      merchant = await Merchant.findOne({ phoneNumber: emailorphone });
    }

    if (!merchant) {
      return res
        .status(401)
        .json({ message: "Login failed: Merchant not found." });
    }

    // Check if the provided password is correct
    const isMatch = await bcrypt.compare(password, merchant.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Login failed: Incorrect password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: merchant._id }, keys.jwtSecret, {
      expiresIn: "1h",
    });

    // Respond with merchant data and token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phoneNumber,
        projectName: merchant.projectName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// POST /send-message - Log the message
router.post("/send-message", (req, res) => {
  const { text } = req.body;
  // console.log("Received message:", text);
  res.status(200).json({ success: true, message: "Message received" });
});

// module.exports = router;

// GET /merchant/:id - Retrieve merchant and associated data
router.get("/merchant/:id", async (req, res) => {
  try {
    // console.log("merchant");
    
    const merchantId = req.params.id;
    const merchant = await Merchant.findById(merchantId);

    // console.log("merchant ID: " + merchantId );

    if (!merchant) {
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });
    }

    const categories = await Category.find({ merchant: merchantId }).sort({ sort: 1 });
    const products = await Product.find({ merchant: merchantId });
    const branches = await Branch.find({ merchant: merchantId });
    const customers = await Customer.find({ merchant: merchantId });

    res.status(200).json({
      success: true,
      merchant,
      categories,
      products,
      branches,
      customers,
    });
  } catch (error) {
    console.error("Error fetching merchant data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Route to handle customer sign-up
router.post("/customers", async (req, res) => {
  const { country, phone, name, email, password } = req.body;

  try {
    // console.log("Plain password during registration:", password); // Log the plain password

    // Hash the password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("Hashed password during registration:", hashedPassword); // Log the hashed password

    const newCustomer = new Customer({
      country,
      phone,
      name,
      email,
      password: hashedPassword, // Save the hashed password
      merchant: "662625076d3391f5ad60c243", // Replace with actual merchant ID
    });

    await newCustomer.save();

    const token = jwt.sign({ id: newCustomer._id }, keys.jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      token: token,
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        country: newCustomer.country,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while creating the customer",
      });
  }
});

// Route to handle customer login
router.post("/Customerlogin", async (req, res) => {
  const { emailorphone, password } = req.body;

  try {
    // console.log("Login request received:", { emailorphone, password });

    let customer;

    // Determine if the identifier is an email or phone number and fetch the customer
    if (emailorphone.includes("@")) {
      customer = await Customer.findOne({ email: emailorphone.toLowerCase() });
    } else {
      customer = await Customer.findOne({ phone: emailorphone });
    }

    if (!customer) {
      // console.log("Customer not found");
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid email or phone number or password",
        });
    }

    // console.log("Plain password:", password);
    // console.log("Stored hashed password:", customer.password);

    const isMatch = await bcrypt.compare(password, customer.password);
    // console.log("Password match result:", isMatch); // Log the result of password comparison

    if (!isMatch) {
      // console.log("Password does not match");
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid email or phone number or password",
        });
    }

    const token = jwt.sign({ id: customer._id }, keys.jwtSecret, {
      expiresIn: "1h",
    });

    // console.log("Login successful, generating token");
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        country: customer.country,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ success: false, message: "An error occurred during login" });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  // console.log("Verifying token...");
  const token = req.headers["authorization"];

  // console.log(token);
  if (!token) {
    // console.log("No token provided");
    return res
      .status(403)
      .json({ success: false, message: "No token provided" });
  }
  jwt.verify(token, keys.jwtSecret, (err, decoded) => {
    if (err) {
      // console.log("Failed to authenticate token");
      return res
        .status(500)
        .json({ success: false, message: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    // console.log("req.userId from verifyToken: ", req.userId);
    next();
  });
};

router.post("/customer/address1", verifyToken, async (req, res) => {
  // console.log("you Reached /api/customer/address1 ");
});

// Route to get customer addresses
router.get("/customer/addresses", verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to update customer profile
router.post("/customer/update", verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.body.id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    const { id, name, email, country, phone } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        email,
        country,
        phone,
      },
      { new: true },
    ).select("-password"); // Exclude password from response

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to change customer password
router.post("/customer/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Hash the new password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    customer.password = hashedPassword;
    await customer.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add address route
router.post("/customer/address", verifyToken, async (req, res) => {
  try {
    const {
      country,
      region,
      addressType,
      street,
      block,
      house,
      district,
      avenue,
      road,
      extraDescription,
      isDefault,
    } = req.body;

    

    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const newAddress = {
      country,
      region,
      addressType,
      street,
      block,
      house,
      district,
      avenue,
      road,
      extraDescription,
      isDefault,
    };

    // Add new address to customer's addresses array
    if (!customer.addresses) {
      customer.addresses = [];
    }
    customer.addresses.push(newAddress);

    // Save the updated customer document
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add this to your existing backend routes
// Add this endpoint to handle address update
router.post("/customer/update-address", verifyToken, async (req, res) => {
  try {
    const { _id, city, block, street, house, region, isDefault } = req.body;

    const address = await Address.findByIdAndUpdate(
      _id,
      { city, block, street, house, region, isDefault },
      { new: true },
    );

    if (isDefault) {
      // If the updated address is set as default, unset the default flag for other addresses
      await Address.updateMany(
        { _id: { $ne: _id }, customer: address.customer },
        { isDefault: false },
      );
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Address updated successfully",
        address,
      });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete address of customer
// POST request to delete an address
router.post("/customer/address/:addressId", verifyToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const customer = await Customer.findById(req.userId);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const address = customer.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    customer.addresses.pull(addressId); // Use pull to remove the address
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: customer.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Route to get products by category number
router.get("/categories/:categoryNumber/products", async (req, res) => {
  try {
    // console.log("Reached /api/categories/:categoryNumber/products");
    const categoryNumber = req.params.categoryNumber;
    // console.log("Category Number: ", categoryNumber);

    const products = await Product.find({ category_number: categoryNumber }).sort({ order_command: 1 });

    // console.log("Products found: ", products);

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found for this category" });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});










// router.post("/submit-order", async (req, res) => {
//   const myWebsite = req.headers.host;
//   const referer = req.headers.referer || 'No referer';

//   // console.log("myWebsite: ", myWebsite);
//   // console.log("Referer: ", referer);

//   try {
//     // console.log("Reached /submit-order");
//     res.redirect(`/payment/pay`);
//     // res.redirect(`/payment/pay?b=5`);
//     // Post to /pay endpoint with a fixed amount of 5
//     // const paymentResponse = await axios.post(`http://${myWebsite}/payment/pay`, {
//     //   amount: 5
//     // });

//     // const redirectUrl = paymentResponse.data.paymentUrl;
//     // // console.log("Payment URL: ", redirectUrl);

//     // res.status(200).json({ redirectUrl: redirectUrl });
//   } catch (error) {
//     console.error("Error processing payment: ", error);
//     res.status(500).json({ success: false, message: "Error processing payment" });
//   }
  
// });



router.post("/submit-order", async (req, res) => {
  try {

    

    

    
    const myWebsite = req.headers.referer || '';
    // console.log("___myWebsite___: ", myWebsite)
    
    const { customerName, items, address, phone, deliveryFee, total, merchant } = req.body;

    // Create a new order
    const newOrder = new Order({
      customerName,
      items,
      address,
      phone,
      deliveryFee,
      total,
      merchant,
      myWebsite
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Log the created order ID
    // console.log("Order submitted with ID:", savedOrder._id);

    res.redirect(`/payment/pay?orderId=${savedOrder._id}`);

    // res.status(201).json({ success: true, message: "Order submitted successfully" });

  } catch (error) {
    console.error("Error submitting order:", error);
    res.status(500).json({ success: false, message: "Error submitting order" });
  }
});














// Assuming you have already required necessary modules and initialized express app
router.get('/orders/:merchantId', async (req, res) => {
  const { merchantId } = req.params;

  // console.log("Merchant ID: ", merchantId);

  try {
    const orders = await Order.find({ merchant: merchantId }).sort({ _id: -1 });

    // console.log("Orders: ", orders);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


router.get('/ordersToday/:merchantId', async (req, res) => {
  const { merchantId } = req.params;
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

  // console.log("Merchant ID: ", merchantId);
  // console.log("Start of Day: ", startOfDay);
  // console.log("End of Day: ", endOfDay);

  try {
    const orders = await Order.find({
      merchant: merchantId,
      time: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ _id: -1 });

    // console.log("Orders Today: ", orders);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching today\'s orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});





// Get order by ID
router.get('/order/:id', async (req, res) => {
  try {
    // console.log("Reached /api/orders/:id")
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// Route to change the status of a chosen order
router.post('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ['new', 'processing', 'completed', 'canceled', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Find the order and update the status
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if cancellation is allowed
    if (status === 'canceled' && !['new', 'processing'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Only new or processing orders can be canceled' });
    }

    if (order.status === 'completed' && status === 'completed') {
      return res.status(200).json({ success: false, message: 'Order is already completed' });
    }

    if (order.status === 'completed' && status === 'returned') {
      return res.status(200).json({ success: false, message: 'Completed order cannot be returned' });
    }

    if (order.status === 'returned' && status === 'returned') {
      return res.status(200).json({ success: false, message: 'Order is already returned' });
    }

    if (order.status === 'returned' && status === 'completed') {
      return res.status(200).json({ success: false, message: 'Returned order cannot be completed' });
    }

    if (status === 'completed' && order.status !== 'completed') {
      // Update stock quantities only if changing to 'completed' from a different status
      for (let item of order.items) {
        if (item.variantId) {
          // Update variant stock
          await Product.updateOne(
            { 'variations._id': item.variantId },
            { $inc: { 'variations.$.v_available_quantity': -item.quantity } }
          );
        } else {
          // Update product stock
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { Stock: -item.quantity } }
          );
        }
      }
    }

    // Handle returned status (increment stock)
    if (status === 'returned' && order.status !== 'returned') {
      for (let item of order.items) {
        if (item.variantId) {
          // Update variant stock
          await Product.updateOne(
            { 'variations._id': item.variantId },
            { $inc: { 'variations.$.v_available_quantity': item.quantity } }
          );
        } else {
          // Update product stock
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { Stock: item.quantity } }
          );
        }
      }
    }

    // Update order status
    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});





// Route to search orders by mobile number
router.post('/orders/search', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  try {
    const orders = await Order.find({ phone }).exec();

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found for this phone number' });
    }

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});


// In your server-side routes file
router.post("/orders/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = req.body;

    const order = await Order.findByIdAndUpdate(id, updatedOrder, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Error updating order" });
  }
});











router.post("/shiftStock", async (req, res) => {
  try {
    const { productId, variantId, quantity, direction } = req.body;

    // Log the data received in the request
    // console.log('Shift Stock Data:', req.body);

    // Validate required fields
    if (!productId || !variantId || !quantity || !direction) {
      return res.status(400).json({ message: 'All fields are required: productId, variantId, quantity, and direction.' });
    }

    // Find the specific variant directly
    const product = await Product.findOne({ _id: productId, 'variations._id': variantId }, { 'variations.$': 1 });

    if (!product) {
      return res.status(404).json({ message: 'Product or variant not found' });
    }

    const variant = product.variations[0];

    // Log the found variant
    // console.log('Found Variant:', variant);

    // Update the stock quantities based on direction
    if (direction === 'toWarehouse') {
      // Shift stock from available quantity to warehouse stock
      await Product.updateOne(
        { _id: productId, 'variations._id': variantId },
        {
          $inc: {
            'variations.$.v_warehouse_stock': quantity,
            'variations.$.v_available_quantity': -quantity
          }
        }
      );
    } else if (direction === 'toShop') {
      // Shift stock from warehouse stock to available quantity
      await Product.updateOne(
        { _id: productId, 'variations._id': variantId },
        {
          $inc: {
            'variations.$.v_warehouse_stock': -quantity,
            'variations.$.v_available_quantity': quantity
          }
        }
      );
    } else {
      return res.status(400).json({ message: 'Invalid direction. Must be "toWarehouse" or "toShop".' });
    }

    // Send a success response
    res.status(200).json({ message: 'Stock shifted successfully' });
  } catch (error) {
    // Handle any errors that occur
    console.error('Error shifting stock:', error);
    res.status(500).json({ message: 'Error shifting stock', error: error.message });
  }
});


router.get('/products/number/:productNumber', (req, res) => {
  const productNumber = req.params.productNumber;
  Product.findOne({ product_number: productNumber })
    .then(product => {
      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }
      res.send({ product });
    })
    .catch(error => res.status(500).send({ message: 'Error fetching product', error }));
});






module.exports = router;