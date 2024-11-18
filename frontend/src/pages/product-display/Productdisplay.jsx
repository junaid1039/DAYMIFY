import React, { useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './productdisplay.css';
import { Context } from '../../context API/Contextapi';
import { useNavigate } from 'react-router-dom';
import Description from '../../components/description/Description';

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

const Productdisplay = ({ product }) => {
    const [mainImage, setMainImage] = useState(product.images?.[0] || product.image);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // State to prevent double clicks
    const { addToCart } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        setMainImage(product.images?.[0] || product.image);
    }, [product]);

    const handleAddToCart = useCallback(() => {
        if (isProcessing) return;
        setIsProcessing(true);

        // Check if sizes or colors are required
        if ((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) {
            alert("Please select both a size and a color.");
            setIsProcessing(false);
            return;
        }

        // Add to cart with or without size/color
        addToCart(product.id, selectedColor || null, selectedSize || null);
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

        // Add to cart and navigate to checkout
        addToCart(product.id, selectedColor || null, selectedSize || null);
        navigate('/cart/checkout');

        setTimeout(() => {
            setIsProcessing(false); // Reset after processing
        }, 300); // Adjust timeout if necessary
    }, [product.id, selectedColor, selectedSize, isProcessing, addToCart, navigate]);

    const handleImageClick = (image) => {
        setMainImage(image);
    };

    const currencySymbol = getCurrencySymbol(product.countryCode);

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

                    {/* Size Selection */}
                    {product.sizes?.length > 0 && (
                        <div className="product-display__size-selection">
                            <h4>Select Size</h4>
                            <div className="sizes">
                                {product.sizes.map((size) => (
                                    <div
                                        key={size}
                                        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
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
                                        key={color}
                                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="product-display__buttons">
                        <button onClick={handleAddToCart} disabled={isProcessing}>Add to Cart</button>
                        <button onClick={handleBuyNow} disabled={isProcessing}>Buy Now</button>
                    </div>
                    <p className="product-display__category"><span>Category :</span> {product.category}</p>
                    <p className="product-display__tags"><span>Tags :</span> Latest</p>
                </div>
            </div>
            <Description description={product.description} />
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
        sizes: PropTypes.arrayOf(PropTypes.string),
        colors: PropTypes.arrayOf(PropTypes.string),
        category: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        countryCode: PropTypes.string.isRequired,
    }).isRequired,
};

export default Productdisplay;
