import React, { useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './productdisplay.css';
import { Context } from '../../context API/Contextapi';
import { useNavigate } from 'react-router-dom';
import Description from '../../components/description/Description';
import ProductFeedback from '../../components/productFeedback/ProductFeedback';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // Add the star icons for ratings

const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'US': return '$';
        case 'EU': return '€';
        case 'GB': return '£';
        case 'AE': return 'د.إ';
        case 'PK': return '₨';
        default: return '$';
    }
};

const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<FaStar key={i} className="star-icon full" />);
        } else if (i - 0.5 <= rating) {
            stars.push(<FaStarHalfAlt key={i} className="star-icon half" />);
        } else {
            stars.push(<FaRegStar key={i} className="star-icon empty" />);
        }
    }
    return stars;
};

const Productdisplay = ({ product }) => {
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const [mainImage, setMainImage] = useState(product.images?.[0] || product.image);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // State to prevent double clicks
    const [feedbacks, setFeedbacks] = useState([]); // State to store feedback data
    const [averageRating, setAverageRating] = useState(0); // State for average rating
    const [totalRatings, setTotalRatings] = useState(0); // State for total ratings
    const { addToCart } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        setMainImage(product.images?.[0] || product.image);
    }, [product]);

    // Fetch feedbacks from the backend
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch(`${baseurl}/feedback/${product.id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error fetching feedback');
                setFeedbacks(data.feedbacks); // Assuming data has 'feedbacks' array

                // Calculate average rating and total ratings
                const total = data.feedbacks.length;
                const sum = data.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
                setAverageRating(total > 0 ? (sum / total).toFixed(1) : 0);
                setTotalRatings(total);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchFeedbacks();
    }, [product.id]);

    const handleAddToCart = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

        // Check if sizes or colors are required
        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            alert("Please select both a size and a color.");
            setIsProcessing(false);
            return;
        }

        // If no size or color selected, use "none"
        const colorToSend = selectedColor || "none";
        const sizeToSend = selectedSize || "none";

        // Add to cart with selected color and size, or "none"
        addToCart(product.id, colorToSend, sizeToSend);

        setTimeout(() => {
            setIsProcessing(false); // Reset after processing
        }, 300); // Adjust timeout if necessary
    }, [product.id, selectedColor, selectedSize, isProcessing, addToCart]);

    const handleBuyNow = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

        // Check if sizes or colors are required
        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            alert("Please select both a size and a color.");
            setIsProcessing(false);
            return;
        }

        // If no size or color selected, use "none"
        const colorToSend = selectedColor || "none";
        const sizeToSend = selectedSize || "none";

        // Add to cart and navigate to checkout
        addToCart(product.id, colorToSend, sizeToSend);
        navigate('/cart/checkout');

        setTimeout(() => {
            setIsProcessing(false); // Reset after processing
        }, 300); // Adjust timeout if necessary
    }, [product.id, selectedColor, selectedSize, isProcessing, addToCart, navigate]);

    const handleImageClick = (image) => {
        setMainImage(image);
    };

    const currencySymbol = getCurrencySymbol(product.countryCode);

    // Determine if product is out of stock
    const isProductOutOfStock = product.available;
    

    return (
        <>
            <div className="product-display">
                <div className="product-display__left">
                    <div className="product-display__main-img">
                        <img src={mainImage} alt={product.name} />
                    </div>
                    <div className="product-display__image-list">
                        {product.images?.map((img, index) => (
                            <img
                                key={img}
                                src={img}
                                alt={`Product thumbnail ${index + 1}`}
                                onClick={() => handleImageClick(img)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>
                </div>
                <div className="product-display__right">
                    <h1>{product.name}</h1>
                    <div className="product-display__prices">
                        {product.oldprice && (
                            <div className="product-display__old-price">{currencySymbol} {product.oldprice}</div>
                        )}
                        <div className="product-display__new-price">{currencySymbol} {product.newprice}</div>
                    </div>

                    {/* Display average rating stars */}
                    {averageRating > 0 && (
                        <div className="product-display__rating">
                            {renderStars(averageRating)} {/* Call the function to render stars */}
                            <span>({totalRatings})</span> {/* Display the number of ratings */}
                        </div>
                    )}

                    {/* Size Selection */}
                    {product.sizes?.length > 0 && (
                        <div className="product-display__size-selection">
                            <h4>Select Size</h4>
                            <div className="sizes">
                                {product.sizes.map((size) => (
                                    <div
                                        key={size._id}
                                        className={`size-option ${selectedSize === size.size ? 'selected' : ''}`}
                                        onClick={() => size.available && setSelectedSize(size.size)}
                                        style={{ opacity: size.available ? 1 : 0.5, cursor: size.available ? 'pointer' : 'not-allowed' }}
                                    >
                                        {size.size}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selection */}
                    {product.colors?.length > 0 && (
                        <div className="product-display__color-selection">
                            <h4>Select Color</h4>
                            <div className="colors">
                                {product.colors.map((color) => (
                                    <div
                                        key={color._id}
                                        className={`color-option ${selectedColor === color.color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color.color, opacity: color.available ? 1 : 0.5, cursor: color.available ? 'pointer' : 'not-allowed' }}
                                        onClick={() => color.available && setSelectedColor(color.color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Out of Stock Message */}
                    {!isProductOutOfStock && <p className="out-of-stock">Out of Stock</p>}

                    <div className="product-display__buttons">
                        <button onClick={handleAddToCart} disabled={isProcessing || !isProductOutOfStock}>Add to Cart</button>
                        <button onClick={handleBuyNow} disabled={isProcessing || !isProductOutOfStock}>Buy Now</button>
                    </div>
                    <p className="product-display__category"><span>Category :</span> {product.category}</p>
                    <p className="product-display__tags"><span>Tags :</span> Latest</p>
                </div>
            </div>
            <Description description={product.description} />
            <ProductFeedback productId={product.id} />
        </>
    );
};

Productdisplay.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
        images: PropTypes.arrayOf(PropTypes.string),
        name: PropTypes.string.isRequired,
        oldprice: PropTypes.number,
        newprice: PropTypes.number.isRequired,
        sizes: PropTypes.arrayOf(PropTypes.shape({
            size: PropTypes.string.isRequired,
            available: PropTypes.bool.isRequired,
        })),
        colors: PropTypes.arrayOf(PropTypes.shape({
            color: PropTypes.string.isRequired,
            available: PropTypes.bool.isRequired,
        })),
        category: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        countryCode: PropTypes.string.isRequired,
        rating: PropTypes.number, // Assuming the product has a rating field
    }).isRequired,
};

export default Productdisplay;
