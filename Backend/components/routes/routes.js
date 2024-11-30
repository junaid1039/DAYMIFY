const express = require('express');
const multer = require('multer'); 
const router = express.Router();
const productController = require('../controllers/productControllers');
const userController = require('../controllers/userControllers');
const cartController = require('../controllers/cartControllers');
const orderController = require('../controllers/orderControllers');
const {uploadImages, uploadCarousel} = require('../controllers/imageControllers') // Image controller for upload
const { auth, userauth, multiAuth } = require('../middleware/auth'); // Middleware for authenticating users
const carouselController  = require('../controllers/carouselController');
const {createQuery, getQueries,updateQuery,deleteQuery} = require('../controllers/userquoryController')
const PopupController = require('../controllers/popupControllers');
const {createPromoCode,validatePromoCode,getAllPromoCodes,deletePromoCode} = require('../controllers/promoController');
const upload = require('../middleware/multer')
const { subscribeUser, getAllSubscribers, unsubscribeUser,delsubscriber } = require("../controllers/NewsLetter");
const feedbackController = require('../controllers/feedbackController');


//All the API Routes are Defined Below.

router.get('/feedbacks', feedbackController.getAllFeedbacks);
router.post('/feedback', feedbackController.addFeedback); // Add feedback for an order
router.get('/feedback/:productId', feedbackController.getFeedbacksByProductId); // Get feedbacks by productId
router.get('/feedback/order/:orderId', feedbackController.getFeedbackByOrderId); // Get feedback by orderId
router.put('/feedback/:productId/:feedbackId/reply', feedbackController.replyToComment); // Reply to a feedback comment
router.delete('/feedback/:productId/:feedbackId', feedbackController.deleteFeedback); // Delete a feedback by feedbackId
router.put('/feedback/:productId/:feedbackId', feedbackController.editFeedback); // Edit a feedback by feedbackId



//newLetter routes
// POST: Subscribe to the newsletter
router.post("/subscribe", subscribeUser);
// GET: Get all subscribers (admin-only endpoint)
router.get("/subscribers", getAllSubscribers);
// POST: Unsubscribe from the newsletter
router.post("/unsubscribe", unsubscribeUser);
//detete subscriber
router.delete("/delsubscriber/:id", delsubscriber);

//promo Code Routes
router.post('/createCode',createPromoCode);
// Route to validate a promo code
router.post('/validateCode', validatePromoCode);
// Route to fetch all active promo codes (for admin use)
router.get('/allCode', getAllPromoCodes);
//delete code
router.delete('/delcode', deletePromoCode);

//popup Routes
router.post('/createpopup',PopupController.createPopup);
router.get('/allpopups', PopupController.getAllPopups);
router.get('/active', PopupController.getActivePopups);
router.get('/getbyid/:id', PopupController.getPopupById);
router.put('/update/:id', PopupController.updatePopup);
router.delete('/del/:id', PopupController.deletePopup);


// Define the routes for quories
router.post('/createquory', createQuery); // Create a new query
router.get('/allquories', getQueries); // Get all queries
//router.get('/:id', getQueryById); // Get a query by ID
router.put('/updatequory/:id', updateQuery); // Update a query by ID
router.delete('/delquory/:id', deleteQuery); // Delete a query by ID

//carousel routes
router.post('/uploadcarousel',multiAuth, upload.single('image'), uploadCarousel);
router.post('/postcarousel', multiAuth, carouselController.addCarousel);
router.get('/getcarousel', carouselController.getAllCarousels);
router.delete('/delcarousel', multiAuth, carouselController.deleteCarousel);

router.post('/uploadimage', upload.array('images', 5), uploadImages); // Handles multiple images
 // Handles multiple images

// Get single product
router.get('/productdata/:id', productController.getProductById);

// Product routes
router.put('/product/:id', multiAuth,  productController.editProduct); 
router.post('/addproduct',multiAuth, productController.addProduct); // Adds a new product
router.post('/removeproduct', multiAuth, productController.removeProduct); // Removes a product
router.get('/allproducts', productController.userAllProducts); // Fetches all visible products
router.get('/adminproducts', multiAuth, productController.adminAllProducts);// fetch all products
router.get('/subcategorys', productController.subcategorys); // Fetches all subcategories

//verify Token
router.get('/verification', multiAuth);

// User routes (Signup and Login)
router.post('/signup', userController.signup); // User registration
router.post('/login', userController.login); // User login

// Cart routes
router.post('/addtocart', cartController.addToCart); // Adds an item to the user's cart
router.post('/removefromcart', cartController.removeFromCart); // Removes an item from the user's cart
router.post('/getcart', userauth, cartController.getCart); // Retrieves the current user's cart items

// Users route
router.get('/users', multiAuth, userController.getAllUsers); // Retrieves all users (admin only)
// Single user details
router.get('/userdetails/:id', userController.getSingleUser); // Retrieves a user's
// Update user details
router.put('/updateuserdetails/:id', multiAuth, userController.updateUserDetails); // Updates a user's
// Delete user
router.delete('/deleteuser/:id', multiAuth, userController.deleteUser); // Deletes a user 


// Order Routes
router.post('/confirmorder', orderController.newOrder); // Places an order
//get all orders
router.get('/allorders', multiAuth, orderController.getAllOrders); // Retrieves all orders for a user
//order details
router.get('/orderdetails/:id', multiAuth, orderController.getOrderDetails); // Retrieves order details
//loged in user order details
router.get('/myorders/:id', userauth, orderController.getMyOrders); // Retrieves order details for the user
router.put('/updateOrderStatus/:id', multiAuth, orderController.updateOrderStatus);  // Updates the status of an order
router.delete('/delorder/:id', multiAuth, orderController.deleteOrder); //delete orders
router.put('/ordersadd/:id/address', orderController.updateOrderAddress);

// Error handling middleware (for handling multer or any unknown errors)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer error
        return res.status(500).json({ success: false, message: err.message });
    } else if (err) {
        // General error
        return res.status(500).json({ success: false, message: 'An unknown error occurred.', error: err.message });
    }
    next(); // Move to the next middleware if no error
});

module.exports = router;
