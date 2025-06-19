import React, { useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './productdisplay.css';
import { Context } from '../../context API/Contextapi';
import { useNavigate } from 'react-router-dom';
import Description from '../../components/description/Description';
import ProductFeedback from '../../components/productFeedback/ProductFeedback';
import { FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mainImage, setMainImage] = useState(product.images?.[0] || product.image);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
    const [magnifierOffset, setMagnifierOffset] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

    const { addToCart } = useContext(Context);
    const navigate = useNavigate();

    // Get all images including the main image
    const allImages = product.images?.length > 0 ? product.images : [product.image];

    useEffect(() => {
        setMainImage(allImages[currentImageIndex]);
    }, [currentImageIndex, allImages]);

    useEffect(() => {
        setMainImage(product.images?.[0] || product.image);
        setCurrentImageIndex(0);
    }, [product]);

    // Fetch feedbacks from the backend
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch(`${baseurl}/feedback/${product.id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error fetching feedback');
                setFeedbacks(data.feedbacks);

                const total = data.feedbacks.length;
                const sum = data.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
                setAverageRating(total > 0 ? (sum / total).toFixed(1) : 0);
                setTotalRatings(total);
            } catch (err) {
                console.error(err.message);
            }
        };

        fetchFeedbacks();
    }, [product.id, baseurl]);

    // Image navigation handlers
    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Magnifier handlers
    const handleMouseEnter = () => {
        setShowMagnifier(true);
    };

    const handleMouseLeave = () => {
        setShowMagnifier(false);
    };

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const offsetX = (x / rect.width) * 100;
        const offsetY = (y / rect.height) * 100;

        setMagnifierOffset({ x: offsetX, y: offsetY });
    };

    // Zoom and pan handlers for mobile
    const handleImageClickMobile = () => {
        setIsZoomed(!isZoomed);
        setPanPosition({ x: 0, y: 0 }); // Reset pan position when toggling zoom
    };

    const handleTouchStart = (e) => {
        if (isZoomed) {
            const touch = e.touches[0];
            setTouchStart({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchMove = (e) => {
        if (isZoomed) {
            e.preventDefault(); // Prevent scrolling
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStart.x;
            const deltaY = touch.clientY - touchStart.y;

            // Update pan position with boundaries
            setPanPosition((prev) => ({
                x: Math.max(Math.min(prev.x + deltaX, 150), -150), // Limit panning
                y: Math.max(Math.min(prev.y + deltaY, 150), -150),
            }));
            setTouchStart({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleAddToCart = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            alert("Please select both a size and a color.");
            setIsProcessing(false);
            return;
        }

        const colorToSend = selectedColor || "none";
        const sizeToSend = selectedSize || "none";

        addToCart(product.id, colorToSend, sizeToSend);

        setTimeout(() => {
            setIsProcessing(false);
        }, 300);
    }, [product.id, selectedColor, selectedSize, isProcessing, addToCart]);

    const handleBuyNow = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            alert("Please select both a size and a color.");
            setIsProcessing(false);
            return;
        }

        const colorToSend = selectedColor || "none";
        const sizeToSend = selectedSize || "none";

        addToCart(product.id, colorToSend, sizeToSend);
        navigate('/cart/checkout');

        setTimeout(() => {
            setIsProcessing(false);
        }, 300);
    }, [product.id, selectedColor, selectedSize, isProcessing, addToCart, navigate]);

    const handleImageClick = (image, index) => {
        setCurrentImageIndex(index);
        setMainImage(image);
    };

    const currencySymbol = getCurrencySymbol(product.countryCode);
    const isProductOutOfStock = product.available;

    return (
        <>
            <div className="product-display">
                <div className="product-display__left">
                    <div className="product-display__main-img-container">
                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    className="product-display__arrow product-display__arrow--left"
                                    onClick={handlePrevImage}
                                    aria-label="Previous image"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    className="product-display__arrow product-display__arrow--right"
                                    onClick={handleNextImage}
                                    aria-label="Next image"
                                >
                                    <FaChevronRight />
                                </button>
                            </>
                        )}

                        {/* Main Image with Magnifier and Zoom */}
                        <div
                            className={`product-display__main-img ${isZoomed ? 'zoomed' : ''}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseMove={handleMouseMove}
                            onClick={handleImageClickMobile}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                        >
                            <img
                                src={mainImage}
                                alt={product.name}
                                style={{
                                    transform: isZoomed ? `scale(2) translate(${panPosition.x}px, ${panPosition.y}px)` : 'none',
                                    transition: isZoomed ? 'none' : 'transform 0.2s ease',
                                }}
                            />
                        </div>

                        {/* Magnifier */}
                        {showMagnifier && (
                            <div
                                className="product-display__magnifier"
                                style={{
                                    left: magnifierPosition.x,
                                    top: magnifierPosition.y,
                                    backgroundImage: `url('${mainImage}')`,
                                    backgroundPosition: `${magnifierOffset.x}% ${magnifierOffset.y}%`,
                                    backgroundSize: '400%',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    <div className="product-display__image-list">
                        {allImages.map((img, index) => (
                            <img
                                key={`${img}-${index}`}
                                src={img}
                                alt={`Product thumbnail ${index + 1}`}
                                className={currentImageIndex === index ? 'active' : ''}
                                onClick={() => handleImageClick(img, index)}
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
                            {renderStars(averageRating)}
                            <span>({totalRatings})</span>
                        </div>
                    )}

                    {/* Size Selection */}
                    {product.sizes?.length > 0 && (
                        <div className="product-display__size-selection">
                            <h4>Select Size</h4>
                            <div className="sizes">
                                {product.sizes.flatMap((sizeObj) =>
                                    sizeObj.size.split(',').map((sizeValue, index) => {
                                        const trimmedSize = sizeValue.trim();
                                        return (
                                            <div
                                                key={`${sizeObj._id}-${index}`}
                                                className={`size-option ${selectedSize === trimmedSize ? 'selected' : ''}`}
                                                onClick={() => sizeObj.available && setSelectedSize(trimmedSize)}
                                                style={{
                                                    opacity: sizeObj.available ? 1 : 0.5,
                                                    cursor: sizeObj.available ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                {trimmedSize}
                                            </div>
                                        );
                                    })
                                )}
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
        rating: PropTypes.number,
        available: PropTypes.bool,
    }).isRequired,
};

export default Productdisplay;