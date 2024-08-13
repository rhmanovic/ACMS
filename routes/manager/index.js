var express = require("express");
var router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const _ = require('lodash'); // Ensure lodash is installed



var Merchant = require("../../models/merchant");
var Category = require("../../models/category");
var Product = require("../../models/product");
var Branch = require("../../models/branch");
const Customer = require('../../models/customer');
const Order = require('../../models/order');

var TransferRequest = require("../../models/transferRequest");
var User = require("../../models/user");
var City = require("../../models/city");
var mid = require("../../middleware");
const keys = require("../../config/keys");
const fs = require("fs");
const ExcelJS = require('exceljs');
const { JSDOM } = require('jsdom');

const sharp = require('sharp');
const PImage = require('pureimage');



var nodemailer = require("nodemailer");


// Set up storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img/upload/')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.get('/productImageGenerator', (req, res) => {
    res.render('manager/productImageGenerator', { title: 'Product Image Generator' });
});

// Route to generate the image with overlay text
router.get('/generate-image', async (req, res) => {
  const productNumber = req.query.product_number; // Get the product number from the query parameter

  try {
    const product = await Product.findOne({ product_number: productNumber });

    if (!product) {
      return res.status(404).send('Product not found');
    }

    const productData = {
      product_image: `/img/upload/${path.basename(product.product_image)}`,
      product_name: product.product_name_ar,
      price: `${product.sale_price.toFixed(3)} KD`,
      variations: product.variations.map(variation => ({
        name: variation.v_name_en,
        price: variation.v_sale_price
      }))
    };

    res.render('manager/productImageGenerator', productData);
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).send('Error fetching product data');
  }
});





router.post('/fill-stock', async (req, res) => {
  const { productId, Stock, ...variationsQuantities } = req.body;
  try {
    console.log('Received form data:', req.body); // Log the received data for debugging

    res.send('Form data received successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});




// GET route to create a dummy product for testing
router.get('/createDummyProduct', async (req, res) => {
  
  const product = new Product({
    merchant: req.session.merchant ? req.session.merchant.id : null,
    sale_price: 3,
    product_name_en: 'Multi-Flavor Juice',
    product_name_ar: 'عصير بنكهات متعددة',
    
    variations: [
      {
        name_ar: 'عصير تفاح',
        name_en: 'Apple Juice',
        sale_price: 2.50,
        purchase_price: 1.50,
        available_quantity: 100,
        barcode: '1234567890123'
      },
      {
        name_ar: 'عصير برتقال',
        name_en: 'Orange Juice',
        sale_price: 2.75,
        purchase_price: 1.75,
        available_quantity: 150,
        barcode: '1234567890124'
      }
    ]
  });

  await product.save();

    console.log('Creating dummy product:', product);
    res.status(200).json({ message: 'Dummy product created successfully', product: product });
});

// POST route to create or update a product with variations
router.post('/products', upload.single('product_image'), async (req, res) => {
    try {
        console.log("Received body: ", JSON.stringify(req.body, null, 2));

        const merchantId = req.session.merchant.id; // Assuming merchant ID is stored in session

        // Destructuring the basic product info from the request body
        const {
            product_number, product_name_en, product_name_ar, category_number, order_command, weight,
            keywords, youtube_video_id, description_ar, description_en,
            sale_price, purchase_price, purchase_limit, barcode, pdt_discount_type, pdt_discount,Stock, brand, warranty, warehouse_stock, options
        } = req.body;

        // Check if a product with the given product_number and merchantId already exists
        let product = await Product.findOne({ product_number: product_number, merchant: merchantId });

        if (product) {
            // Update existing product fields
            product.product_name_en = product_name_en;
            product.brand =brand;
            product.warranty =warranty;
            product.product_name_ar = product_name_ar;
            product.category_number = category_number;
            product.order_command = order_command;
            product.weight = weight;
            product.keywords = keywords;
            // Update product image only if a new image was uploaded
            if (req.file) {
                product.product_image = req.file.path.replace('public', '');
            }
            product.youtube_video_id = youtube_video_id;
            product.description_ar = description_ar;
            product.options = options;
            product.description_en = description_en;
            product.sale_price = sale_price;
            product.category_number = category_number;
            product.purchase_price = purchase_price || 0;
          
            product.purchase_limit = purchase_limit || 0;
            product.warehouse_stock = warehouse_stock || 0;
            product.barcode = barcode;
            product.pdt_discount_type = pdt_discount_type;
            product.pdt_discount = pdt_discount;
            product.Stock = Stock || 0;

            // Update variations if provided
            if (Array.isArray(req.body.v_name_en) && req.body.v_name_en.length > 0) {
                product.variations = req.body.v_name_en.map((_, index) => ({
                    v_name_en: req.body.v_name_en[index] || '',
                    v_name_ar: req.body.v_name_ar[index] || '',
                    v_sale_price: req.body.v_sale_price[index] || 0,
                    v_purchase_price: req.body.v_purchase_price[index] || 0,
                    v_available_quantity: req.body.v_available_quantity[index] || 0,
                      v_warehouse_stock: req.body.v_warehouse_stock[index] || 0,
                    v_purchase_limit: req.body.v_purchase_limit[index] || 0,
                    v_barcode: req.body.v_barcode[index] || '',
                    v_brand: req.body.v_brand[index] || '',
                    v_warranty: req.body.v_warranty[index] || ''
                }));
            } else {
              product.variations = []; // Clear variations if none are provided
            }

            await product.save(); // Save updates
            res.redirect('/manager/products'); // Redirect to the product management page
        } else {
            // No existing product found, create a new one
            const newProduct = new Product({
                product_number,
                product_name_en,
                product_name_ar,
                category_number,
                brand,
                warranty,
                order_command,
                weight,
                keywords,
                product_image: req.file ? req.file.path.replace('public', '') : '',
                youtube_video_id,
                options,
                description_ar,
                description_en,
                merchant: merchantId, // Attach the merchant ID as a reference
                sale_price,
                purchase_price: purchase_price || 0,
                Stock: Stock || 0,
                purchase_limit: purchase_limit || 0,
                warehouse_stock: warehouse_stock   || 0
            });

            // Handle variations for new product
            if (Array.isArray(req.body.v_name_en) && req.body.v_name_en.length > 0) {
                newProduct.variations = req.body.v_name_en.map((_, index) => ({
                    v_name_en: req.body.v_name_en[index] || '',
                    v_name_ar: req.body.v_name_ar[index] || '',
                    v_sale_price: req.body.v_sale_price[index] || 0,
                    v_purchase_price: req.body.v_purchase_price[index] || 0,
                    v_available_quantity: req.body.v_available_quantity[index] || 0,
                      v_warehouse_stock: req.body.v_warehouse_stock[index] || 0,
                    v_purchase_limit: req.body.v_purchase_limit[index] || 0,
                    v_barcode: req.body.v_barcode[index] || '',
                    v_brand: req.body.v_brand[index] || '',
                    v_warranty: req.body.v_warranty[index] || ''
                }));
            }

            await newProduct.save(); // Save new product
            res.redirect('/manager/products'); // Redirect to the product management page
        }
    } catch (error) {
        console.error('Failed to add or update product', error);
        res.status(500).send('Error processing product');
    }
});




router.post('/product/delete', async (req, res) => {
    const { productToDeleteID } = req.body;
    try {
        const productToDelete = await Product.findById(productToDeleteID);

        if (!productToDelete) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the product belongs to the currently logged in merchant
        if (productToDelete.merchant){
          if (productToDelete.merchant.toString() !== req.session.merchant.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
          }
        } else {
          res.status(500).json({ error: 'No Merchants found for this product' });
        }
      

        const deletedProduct = await Product.findByIdAndDelete(productToDeleteID);

        res.redirect('back');
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// GET /product/view/:product_number
router.get('/product/view/:product_number', async (req, res) => {
    try {
        const merchantId = req.session.merchant.id;
        const productNumber = req.params.product_number;
        const product = await Product.findOne({ product_number: productNumber, merchant: merchantId });

        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        console.log('Logging merchantId:', merchantId);
        console.log('Logging productNumber:', productNumber);
        console.log('Logging product:', product);
        
        // Find category based on product.category and return only ArabicName and EnglishName
        const productCategory = await Category.findOne({ category_number: product.category_number }, { ArabicName: 1, EnglishName: 1 });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.render('manager/productView', { title: product.product_name_ar, product, productCategory });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// GET /login
router.get("/login", mid.loggedOut, function (req, res, next) {
  return res.render("manager/login", { title: "Log In" });
});


router.post('/categories/delete', async (req, res) => {
    const { categoryToDeleteID } = req.body;
    try {
        const categoryToDelete = await Category.findById(categoryToDeleteID);

        if (!categoryToDelete) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if the category belongs to the currently logged in merchant
        if (categoryToDelete.merchant.toString() !== req.session.merchant.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const deletedCategory = await Category.findByIdAndDelete(categoryToDeleteID);

        res.redirect('back');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/branch/delete', async (req, res) => {
    const { branchToDeleteID } = req.body;
    try {
        const branchToDelete = await Branch.findById(branchToDeleteID);

        if (!branchToDelete) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        // Check if the branch belongs to the currently logged in merchant
        if (branchToDelete.merchant.toString() !== req.session.merchant.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const deletedBranch = await Branch.findByIdAndDelete(branchToDeleteID);

        res.redirect('back');
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





router.post('/categories/update-status', async (req, res) => {
  const { id, status } = req.body;
  console.log("update-status")
  try {
    // Update the status of the category with the given id
    const updatedCategory = await Category.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/branch/update-status', async (req, res) => {
  const { id, status, name } = req.body;
  console.log("update-status ID: " + id)
  console.log("update-status name: " + name)
  console.log("update-status status: " + status)
  try {


    const { id, status, name } = req.body;
    const update = { [name]: status };
    const updatedBranch = await Branch.findByIdAndUpdate(id, update, { new: true });

    


    if (!updatedBranch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(updatedBranch);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/product/update-status', async (req, res) => {
  const { id, status } = req.body;
  console.log("update-status")
  try {
    // Update the status of the category with the given id
    const updatedProduct = await Product.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating category status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// POST route to handle form submission
router.post('/update-price', async (req, res) => {
  try {
      // Extracting data from the request body
      const { value, type, productId } = req.body;

      // Finding the product by productId
      const product = await Product.findOne({ _id: productId });

      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Update the product based on the type
      let updatedValue;
      if (type === 'sale_price') {
          product.sale_price = value;
          updatedValue = product.sale_price;
      } else if (type === 'purchase_price') {
          product.purchase_price = value;
          updatedValue = product.purchase_price;
      } else {
          return res.status(400).send('Invalid update type');
      }

      // Save the updated product
      await product.save();

      // Sending a response back to the client with the updated value
      res.json({ message: 'Product updated successfully', updatedValue });
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
  }
});



router.post('/update-stock', async (req, res) => {
  try {
    const { value, productId } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.Stock = value;
    await product.save();

    res.json({ message: 'Product updated successfully', updatedValue: product.Stock });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.post('/login', async (req, res) => {
  try {
    const { emailorphone, password } = req.body;
    let merchant;

    // Determine if the identifier is an email or phone number and fetch the merchant
    if (emailorphone.includes('@')) {
      merchant = await Merchant.findOne({ email: emailorphone.toLowerCase() });
    } else {
      merchant = await Merchant.findOne({ phoneNumber: emailorphone });
    }

    if (!merchant) {
      return res.status(401).send('Login failed: Merchant not found.');
    }

    // Check if the provided password is correct
    const isMatch = await bcrypt.compare(password, merchant.password);
    if (!isMatch) {
      return res.status(401).send('Login failed: Incorrect password.');
    }

    // Store merchant data in session
    req.session.merchant = {
      id: merchant._id,
      projectName: merchant.projectName,
      name: merchant.name
    };

    // Redirect or send a success message
    res.redirect('/manager'); // Redirect to a dashboard or some other page
  } catch (error) {
    res.status(500).send('Server error: ' + error.message);
  }
});


// Dashboard route
router.get('/dashboard', (req, res) => {
  if (!req.session.merchant) {
    // Redirect the user to the login page if they are not logged in
    return res.redirect('/manager/login');
  }

  // Render a dashboard page using session data
  res.render('manager/dashboard', {
    merchantID: req.session.merchant.id,
    projectName: req.session.merchant.projectName,
    name: req.session.merchant.name
  });
});

// Dashboard route
router.get('/dashboard2', (req, res) => {
  if (!req.session.merchant) {
    // Redirect the user to the login page if they are not logged in
    return res.redirect('/manager/login');
  }

  // Render a dashboard page using session data
  res.render('manager/dashboard2', {
    merchantID: req.session.merchant.id,
    projectName: req.session.merchant.projectName,
    name: req.session.merchant.name
  });
});


router.post('/random-number', (req, res) => {
  const { min, max } = req.body;
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
  res.json({ randomNumber });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out.');
    }
    res.redirect('/manager/login');
  });
});







router.get("/", mid.requiresLogin, function (req, res, next) {
  
  res.redirect('/manager/orders');
});

// Route to render the orders management page
router.get('/orders', mid.requiresLogin, async (req, res) => {
  try {
    const merchantId = req.session.merchant.id;
    const perPage = 10;
    const page = req.query.page || 1;

    // Fetch orders associated with the merchant, sorted by time in descending order and paginated
    const orders = await Order.find({ merchant: merchantId })
                              .sort({ time: -1 })
                              .skip((perPage * page) - perPage)
                              .limit(perPage);

    const count = await Order.countDocuments({ merchant: merchantId });

    // Render the Pug template with the orders data and pagination info
    res.render('manager/orders', { 
      title: 'Orders', 
      orders, 
      current: page,
      pages: Math.ceil(count / perPage) 
    });
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


// Route to render the products management page
router.get('/products', mid.requiresLogin, async (req, res) => {
  try {
    const merchantId = req.session.merchant.id;
    
    
    
    const products = await Product.find({ merchant: merchantId });
    const categories = await Category.find({ merchant: merchantId });
    res.render('manager/products', { products, categories }); // Render the Pug template with the products data
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Route to render the products management page
router.get('/productsPrint', mid.requiresLogin, async (req, res) => {
  try {
    const merchantId = req.session.merchant.id;
    
    
    
    const products = await Product.find({ merchant: merchantId }).sort({ order_command: 1 });
    const categories = await Category.find({ merchant: merchantId });
    res.render('manager/productsPrint', { products, categories }); // Render the Pug template with the products data
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Internal Server Error');
  }
});




// Function to extract text from HTML, replacing tags with a space
function extractText(htmlString) {
  return htmlString.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

router.get('/exportproducts', mid.requiresLogin, async (req, res) => {
    try {
        const merchantId = req.session.merchant.id;
        const products = await Product.find({ merchant: merchantId }).lean();

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Products');

        

       

        

        // Define columns with alignment settings applied at definition
        worksheet.columns = [
            { header: 'Product Number', key: 'product_number', width: 15, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Product Name EN', key: 'product_name_en', width: 15, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Product Name AR', key: 'product_name_ar', width: 15, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Description AR', key: 'description_ar', width: 30, style: { alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } } },
            { header: 'Description EN', key: 'description_en', width: 30, style: { alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } } },
            { header: 'Category Number', key: 'category_number', width: 24, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Sale Price', key: 'sale_price', width: 10, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Purchase Price', key: 'purchase_price', width: 15, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Stock', key: 'stock', width: 10, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Status', key: 'status', width: 10, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Options', key: 'options', width: 10, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Product Type', key: 'product_type', width: 12, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Name EN', key: 'v_name_en', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Name AR', key: 'v_name_ar', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Sale Price', key: 'v_sale_price', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Purchase Price', key: 'v_purchase_price', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Quantity', key: 'v_available_quantity', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Warehouse', key: 'v_warehouse_stock', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } },
            { header: 'Variation Barcode', key: 'v_barcode', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } } }
        ];


        // Set header font style to bold after defining columns
        worksheet.getRow(1).font = { bold: true };

        
       


        products.forEach(product => {
            // Extract text from HTML descriptions for the main product
            product.description_ar = extractText(product.description_ar);
            product.description_en = extractText(product.description_en);

            if (product.variations && product.variations.length > 0) {
                // Process each variation as a new row
                product.variations.forEach(variation => {
                    const row = {
                        ...product,
                        v_name_en: variation.v_name_en,
                        v_name_ar: variation.v_name_ar,
                        v_sale_price: variation.v_sale_price,
                        v_purchase_price: variation.v_purchase_price,
                        v_available_quantity: variation.v_available_quantity,
                        v_warehouse_stock: variation.v_warehouse_stock,
                        v_barcode: variation.v_barcode,
                    };
                    worksheet.addRow(row);
                });
            } else {
                // Add the product without variations
                worksheet.addRow(product);
            }
        });

        const fileName = 'Products.xlsx';
        await workbook.xlsx.writeFile(fileName);
        res.download(fileName);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to download products");
    }
});


router.get('/exportcategories', async (req, res) => {
    try {
        const merchantId = req.session.merchant.id;
        const categories = await Category.find({ merchant: merchantId }).lean();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Categories');

        // Define columns for the Excel sheet
        worksheet.columns = [
            { header: 'Category Number', key: 'category_number', width: 18, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            { header: 'Arabic Name', key: 'ArabicName', width: 25, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            { header: 'English Name', key: 'EnglishName', width: 25, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            // { header: 'Image Source', key: 'imgsrc', width: 30 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Category Link', key: 'categoryLink', width: 30, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            // { header: 'Merchant ID', key: 'merchant', width: 24, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            { header: 'Discount Percentage', key: 'discountPerc', width: 20, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  },
            { header: 'Sort Order', key: 'sort', width: 12, style: { alignment: { horizontal: 'center', vertical: 'middle' } }  }
        ];

        // Add data rows to the worksheet
        categories.forEach(category => {
            worksheet.addRow({
                category_number: category.category_number,
                ArabicName: category.ArabicName,
                EnglishName: category.EnglishName,
                imgsrc: category.imgsrc,
                status: category.status,
                categoryLink: category.categoryLink,
                merchant: category.merchant.toString(), // Assuming 'merchant' is an ObjectId
                discountPerc: category.discountPerc,
                sort: category.sort
            });
        });

        // Set header font style to bold after defining columns
        worksheet.getRow(1).font = { bold: true };

        // Write to a file and send it as a response
        const fileName = `Categories-${Date.now()}.xlsx`;
        await workbook.xlsx.writeFile(fileName);
        res.download(fileName, () => {
            // Optionally delete the file after sending it to the user
            require('fs').unlinkSync(fileName);
        });
    } catch (error) {
        console.error('Failed to export categories:', error);
        res.status(500).send('Failed to export categories');
    }
});






router.get("/product/form/:product_number", mid.requiresLogin, async function (req, res, next) {
    try {
        const merchantId = req.session.merchant.id;
        const productNumber = req.params.product_number;
        const categories = await Category.find({ merchant: merchantId });

        // Check if the route is for adding a new product
        if (productNumber === "new") {
            return res.render("manager/productForm", {
                title: "Add New Product",
                categories: categories, // Pass the categories to the Pug template
                product: "" // No product to pass since it's a new entry
            });
        } else {
            const product = await Product.findOne({ product_number: productNumber, merchant: merchantId });

            if (product) {
                return res.render("manager/productForm", {
                    title: "Edit Product",
                    categories: categories,
                    product: product // Pass the existing product to the Pug template
                });
            } else {
                // Product not found with the given product_number
                return res.status(404).send("Product not found");
            }
        }
    } catch (error) {
        console.error('Error retrieving product or categories:', error);
        return res.status(500).send('Error retrieving product or categories');
    }
});




router.get("/category", mid.requiresLogin,  async function (req, res, next) {
  

  try {
    const merchantId = req.session.merchant.id;
    const categories = await Category.find({ merchant: merchantId });
    return res.render("manager/category", {
      title: "Category",
      categories: categories // Pass the categories to the Pug template
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return res.status(500).send('Error retrieving categories');
  }
});

router.get("/category/form", async function (req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    return res.render("manager/categoryForm", { title: "Edit New Category", category: category });
  } catch (error) {
    console.error('Error finding category by id:', error);
    return res.status(500).send('Error finding category');
  }
});

router.get("/category/form/:id", async function (req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    return res.render("manager/categoryForm", { title: "Edit New Category", category: category });
  } catch (error) {
    console.error('Error finding category by id:', error);
    return res.status(500).send('Error finding category');
  }
});


router.get("/branch/form/:id", async function (req, res, next) {
  try {
    var branch = [];
    if (req.params.id == "new"){
      branch = [];
    } else {
      branch = await Branch.findById(req.params.id);
    }
    
    return res.render("manager/branchForm", { title: "Edit New Branch", branch: branch });
  } catch (error) {
    console.error('Error finding branch by id:', error);
    return res.status(500).send('Error finding branch');
  }
});





router.get("/branch", mid.requiresLogin,  async function (req, res, next) {


  

  try {
    const merchantId = req.session.merchant.id;
    const branches = await Branch.find({ merchant: merchantId },
      { 
         branch_name_ar: 1, 
         branch_name_en: 1, 
         phone: 1, 
         status: 1,
         isBusy: 1,
         deliveryAvailable: 1,
         pickupAvailable: 1,
         scheduleAvailable: 1,
      });

    
    return res.render("manager/branch", {
      title: "Branch",
      branches: branches // Pass the branches to the Pug template
    });
  } catch (error) {
    console.error('Error retrieving branches:', error);
    return res.status(500).send('Error retrieving branches');
  }
});

router.get("/branch/form", function (req, res, next) {
  return res.render("manager/branchForm", { title: "Add New Branch"});
});






router.get("/customers", mid.requiresLogin,  async function (req, res, next) {


  try {
    const merchantId = req.session.merchant.id;
    const customers = await Customer.find({ merchant: merchantId });
    return res.render("manager/customers", {
      title: "Customers",
      customers: customers // Pass the categories to the Pug template
    });
  } catch (error) {
    console.error('Error retrieving customers:', error);
    return res.status(500).send('Error retrieving customers');
  }
});



router.get("/customer/form/:id", async function (req, res, next) {
  try {
    var customer = [];
    if (req.params.id == "new"){
      customer = [];
    } else {
      customer = await Customer.findById(req.params.id);
    }

    return res.render("manager/customerForm", { title: "Edit New Customer", customer: customer });
  } catch (error) {
    console.error('Error finding customer by id:', error);
    return res.status(500).send('Error finding customer');
  }
});

router.get("/customer/customerBalanceForm", function (req, res, next) {
  return res.render("manager/customerBalanceForm", { title: "Add Customer Balance"});
});

router.get("/customer/customerOrders", function (req, res, next) {
  return res.render("manager/customerOrders", { title: "Customer Orders"});
});

router.get("/customer/customerAddress", function (req, res, next) {
  return res.render("manager/customerAddress", { title: "Customer Address"});
});


router.get("/coupon", function (req, res, next) {
  return res.render("manager/coupon", { title: "Coupon" });
});

router.get("/subusers", function (req, res, next) {
  return res.render("manager/subusers", { title: "Sub Users" });
});

router.get("/settings", async function (req, res, next) {
  try {
    // Assuming the merchant ID is stored in the session
    const merchantId = req.session.merchant.id;

    // Fetch the merchant data from the database
    const merchant = await Merchant.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Render the settings page and pass the merchant data to the view
    return res.render("manager/settings", { 
      title: "Settings", 
      merchant 
    });
  } catch (error) {
    console.error('Error fetching merchant data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/update-tap-settings', async (req, res) => {
  const { live_authorization, test_authorization, status, mode } = req.body;

  try {
    // Assuming the merchant ID is stored in the session
    const merchantId = req.session.merchant.id;

    // Determine if the mode should be 'live' or 'test' based on the checkbox value
    const finalMode = mode === 'true' ? 'live' : 'test';

    // Update the merchant's TAP settings
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      {
        'tapSettings.liveAuthorization': live_authorization,
        'tapSettings.testAuthorization': test_authorization,
        'tapSettings.status': status === 'on',  // Convert to boolean
        'tapSettings.mode': finalMode  // Set mode based on the checkbox value
      },
      { new: true }
    );

    if (!updatedMerchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.redirect('/manager/settings'); // Redirect to the merchant's management page or any other page
  } catch (error) {
    console.error('Failed to update TAP settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





router.get("/notifications", function (req, res, next) {
  return res.render("manager/notifications", { title: "Notifications" });
});


// GET /register
router.get("/register", mid.loggedOut, function (req, res, next) {
  return res.render("manager/register", { title: "Sign Up" });
});

router.post('/register1', (req, res) => {
    console.log('We reached the correct place and sending a message');
    res.send('Message sent successfully');
});

router.post('/register', async (req, res) => {
  try {
    console.log('Register endpoint hit'); // Initial log for endpoint hit
    const { name, project, phone, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!name || !project || !phone || !email || !password || password !== confirmPassword) {
      console.log('Validation failed'); // Log validation issues
      return res.status(400).send('All fields are required and passwords must match.');
    }

    // Check for existing merchant
    const existingMerchant = await Merchant.findOne({ email: email.toLowerCase() });
    if (existingMerchant) {
      console.log('Email already in use'); // Log email conflict
      return res.status(409).send('Email already in use.');
    }

    // Create a new merchant instance
    const newMerchant = new Merchant({
      name,
      projectName: project,
      phoneNumber: phone,
      email,
      password
    });

    // Save the new merchant to the database
    await newMerchant.save(); // Save operation to persist the merchant

    console.log('New merchant created:', newMerchant); // Log successful creation

    // Store merchant data in session
    req.session.merchant = {
      id: newMerchant._id,
      projectName: newMerchant.projectName,
      name: newMerchant.name
    };

    // Redirect or send a success message
    res.redirect('/manager'); // Redirect to a dashboard or some other page

  } catch (error) {
    console.error('Server error:', error); // Log server errors
    res.status(500).send('Server error: ' + error.message);
  }
});

router.get('/downloadExcel', (req, res) => {
    // Sample JSON data
    const jsonData = [
        { Name: 'John', Age: 30, City: 'New York' },
        { Name: 'Alice', Age: 25, City: 'Los Angeles' },
        { Name: 'Bob', Age: 35, City: 'Chicago' }
    ];

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add JSON data to the worksheet
    worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'City', key: 'city', width: 20 }
    ];

    worksheet.addRows(jsonData);

    // Save workbook to a buffer
    workbook.xlsx.writeBuffer().then(buffer => {
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');

        // Send buffer as the response
        res.send(buffer);
    }).catch(err => {
        console.log('Error:', err);
        res.status(500).send('Internal Server Error');
    });
});




router.post('/add-category', upload.single('category_img'), async (req, res) => {
  var { ArabicName, EnglishName, discountPerc, sort, status } = req.body;
  // Modify the path by removing the 'public/' prefix
  const imgsrc = req.file ? req.file.path.replace('public', '') : ''; // Remove 'public/' from the path

  const merchantId = req.session.merchant.id; // Assuming merchant ID is stored in the session

  
  // Ensure sort is 0 if it is empty
  if (sort === "") {
      sort = 0;
  }
  if (discountPerc === "") {
        discountPerc = 0;
  }

  
  try {
    const newCategory = new Category({
      ArabicName,
      EnglishName,
      imgsrc, // Use the modified path
      discountPerc,
      sort,
      status: status === 'on',
      merchant: merchantId  // Adding the Merchant ID to the Category
    });

    await newCategory.save();
    res.redirect('/manager/category');
  } catch (error) {
    console.error('Failed to add category', error);
    res.status(500).send('Error saving category');
  }
});


router.post('/edit-category', upload.single('category_img'), async (req, res) => {
    var { categoryId, ArabicName, EnglishName, discountPerc, sort, status } = req.body;
  

    // Only update imgsrc if a new file is uploaded
    var imgsrc = '';
    if (req.file) {
        imgsrc = req.file.path.replace('public', '');
    } else {
        // If no new file is uploaded, use the existing image source
        // You need to retrieve it from the database as it's not provided in the form submission
        const existingCategory = await Category.findById(categoryId);
        if (existingCategory) {
            imgsrc = existingCategory.imgsrc;
        }
    }

    try {
        status = Boolean(status); // Simplify the status assignment to a boolean conversion

        console.log('Log req.body:', req.body);
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
            ArabicName,
            EnglishName,
            imgsrc,
            discountPerc,
            sort,
            status
        }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.redirect('/manager/category');
    } catch (error) {
        console.error('Failed to edit category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add-branch', async (req, res) => {
  // Extracting fields from the request body
  var { id, status, isBusy, deliveryAvailable, pickupAvailable, scheduleAvailable, branch_name_ar, branch_name_en, addressAr, addressEn, phone, email, latitude, longitude, } = req.body;

  console.log("id: " + id);

  status = status === 'on' ? true : false;
  isBusy = isBusy === 'on' ? true : false;
  deliveryAvailable = deliveryAvailable === 'on' ? true : false;
  pickupAvailable = pickupAvailable === 'on' ? true : false;
  scheduleAvailable = scheduleAvailable === 'on' ? true : false;

  const merchantId = req.session.merchant.id;

  try {
    let branch;
    if (id) {
      // Update existing branch
      console.log("Update existing branch");
      branch = await Branch.findByIdAndUpdate(id, {
        status: status,
        latitude: latitude,
        longitude: longitude,        
        isBusy: isBusy,
        deliveryAvailable: deliveryAvailable,
        pickupAvailable: pickupAvailable,
        scheduleAvailable: scheduleAvailable,
        branch_name_ar: branch_name_ar,
        branch_name_en: branch_name_en,
        addressAr: addressAr,
        addressEn: addressEn,
        phone: phone,
        email: email,
        merchant: merchantId
      });
    } else {
      // Create new branch
      console.log("Create new branch");
      branch = new Branch({
        status: status,
        latitude: latitude,
        longitude: longitude,       
        isBusy: isBusy,
        deliveryAvailable: deliveryAvailable,
        pickupAvailable: pickupAvailable,
        scheduleAvailable: scheduleAvailable,
        branch_name_ar: branch_name_ar,
        branch_name_en: branch_name_en,
        addressAr: addressAr,
        addressEn: addressEn,
        phone: phone,
        email: email,
        merchant: merchantId
      });
    }

    await branch.save();
    res.redirect('/manager/branch');
  } catch (error) {
    console.error('Failed to add/update branch', error);
    res.status(500).send('Error saving branch');
  }
});



// POST route to add or update a customer
router.post('/add-customer', async (req, res) => {
  const { name, email, phone, password, confirmPassword, country, id } = req.body;
  const merchantId = req.session.merchant.id;

  try {
    // Check if there's an ID to determine if updating or creating a new customer
    if (id) {
      let updateObject = {
        name,
        email,
        phone,
        country,
        merchant: merchantId
      };

      // Include password in the update only if it's provided and confirmed
      if (password && confirmPassword) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        updateObject.password = password; // Assuming password hashing is handled in pre-save middleware
      }

      // Find the customer by ID and update
      const updatedCustomer = await Customer.findByIdAndUpdate(id, updateObject, { new: true, omitUndefined: true });
      if (!updatedCustomer) {
        throw new Error('Customer not found');
      }

      res.redirect('/manager/customers');
    } else {
      // No ID provided, create a new customer
      // Ensure both password and confirmPassword are provided and match
      if (password || confirmPassword) { // Check if either field is provided
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
      } else {
        throw new Error('Passwords or ConfirmaPassword are not provided');
      }

      const newCustomer = new Customer({
        name,
        email,
        phone,
        password, // Ensure password is hashed in the model's pre-save middleware
        country,
        merchant: merchantId
      });

      // Save the new customer
      await newCustomer.save();
      res.redirect('/manager/customers');
    }
  } catch (error) {
    // Handle errors and send back an appropriate response
    console.error('Failed to add or update customer:', error);
    res.status(400).render('add-customer', {
      error: error.message,
      customer: req.body // Send back the input data to refill the form in case of error
    });
  }
});










module.exports = router;
