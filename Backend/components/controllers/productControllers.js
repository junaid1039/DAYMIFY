const Product = require('../models/productmodel');
const cloudinary = require('../utils/cloudinary');

// Define a mapping from country codes to currencies
const countryToCurrency = {
    US: 'USD',
    DE: 'EUR',
    PK: 'PKR',
    GB: 'GBP',
    AE: 'AED',
    // Add more mappings as needed
};

// Helper function to get price by currency
const getPriceByCurrency = (product, currency) => {
    return product.prices[currency] || product.prices['USD'];
};

// Add a new product
const addProduct = async (req, res) => {
    const generateNewId = async () => {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        return lastProduct ? lastProduct.id + 1 : 1;
    };
    const newId = await generateNewId();

    try {
        const {
            name,
            images,
            category,
            prices,
            description,
            colors,
            sizes,
            brand,
            visible
        } = req.body;

        if (!name || !images || !category || !description || visible === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const validPrices = {};
        if (prices) {
            ['USD', 'EUR', 'PKR', 'GBP', 'AED'].forEach(currency => {
                if (prices[currency] && prices[currency].oldprice && prices[currency].newprice) {
                    if (isNaN(prices[currency].oldprice) || isNaN(prices[currency].newprice)) {
                        return res.status(400).json({ success: false, message: `Invalid price format for ${currency}` });
                    }
                    validPrices[currency] = prices[currency];
                }
            });
        }

        const product = new Product({
            id: newId,
            name,
            images,
            category,
            prices: validPrices,
            description,
            colors,
            sizes,
            brand,
            visible,
        });

        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: 'Failed to save product', error });
    }
};

// Edit product
const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findOne({ id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const updatedData = {
            name: req.body.name,
            images: req.body.images,
            category: req.body.category,
            prices: req.body.prices,
            description: req.body.description,
            colors: req.body.colors,
            sizes: req.body.sizes,
            brand: req.body.brand,
            visible: req.body.visible,
        };

        const updatedProduct = await Product.findOneAndUpdate(
            { id },
            updatedData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: 'Failed to update product', error });
    }
};

// Remove product from database
const removeProduct = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findOne({ id: req.body.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (Array.isArray(product.images)) {
            // Delete images from Cloudinary using their URLs
            const imageDeletionPromises = product.images.map(imageUrl => {
                // Extract public ID from the Cloudinary URL
                const publicId = extractPublicIdFromUrl(imageUrl);
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(imageDeletionPromises);
        }

        await Product.findOneAndDelete({ id: req.body.id });
        res.status(200).json({ success: true, message: 'Product and associated images removed successfully' });
    } catch (error) {
        console.error('Error removing product and images:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const fileNameWithExtension = parts[parts.length - 1]; // Get last part, e.g., 'ahg4isiwal25k7exewmg.jpg'
    const publicId = fileNameWithExtension.split('.')[0]; // Remove the extension to get the public ID
    return publicId;
};


// Get all products for admin (no currency filtering, showing all data)
const adminAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ success: true, products });
    } catch (error) {
        console.error("Error fetching admin products:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin products', error });
    }
};

// Get all visible products for users with frontend-based currency
const userAllProducts = async (req, res) => {
    const countryCode = req.query.countryCode || 'US';
    const currency = req.query.currency || countryToCurrency[countryCode] || 'USD';
    try {
        const products = await Product.find({ visible: true });
        const productsWithPrices = products.map(product => {
            const { newprice, oldprice } = getPriceByCurrency(product, currency);
            return {
                id: product.id,
                images: product.images,
                name: product.name,
                category: product.category,
                description: product.description,
                sizes: product.sizes,
                colors: product.colors,
                newprice,
                oldprice,
                countryCode,
            };
        });

        res.json({
            success: true,
            products: productsWithPrices
        });
    } catch (error) {
        console.error("Error fetching user products:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch user products', error });
    }
};

// Get a single product by ID with frontend-based currency
const getProductById = async (req, res) => {
    const { id } = req.params;
    const countryCode = req.query.countryCode || 'US';
    const currency = req.query.currency || countryToCurrency[countryCode] || 'USD';
    

    try {
        const product = await Product.findOne({ id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const priceData = getPriceByCurrency(product, currency);
        res.json({
            success: true,
            product: {
                ...product.toObject(),
                newprice: priceData.newprice,
                oldprice: priceData.oldprice,
                countryCode,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product', error });
    }
};

// Fetch products by category with frontend-based currency
const subcategorys = async (req, res) => {
    const { category } = req.query;
    const countryCode = req.query.countryCode || 'US';
    const currency = req.query.currency || countryToCurrency[countryCode] || 'USD';

    try {
        if (!category) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        const products = await Product.find({ category, visible: true }).limit(4);
        const productsWithPrices = products.map(product => {
            const priceData = getPriceByCurrency(product, currency);
            return {
                ...product.toObject(),
                newprice: priceData.newprice,
                oldprice: priceData.oldprice,
                countryCode: countryCode,
            };
        });

        res.json({ success: true, products: productsWithPrices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products', error });
    }
};

module.exports = { addProduct, removeProduct, userAllProducts, adminAllProducts, editProduct, subcategorys, getProductById };
