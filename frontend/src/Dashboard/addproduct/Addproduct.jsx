import React, { useState } from 'react';
import './addproduct.css';
import { IoMdCloudUpload } from "react-icons/io";

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const Addproduct = () => {
    const [images, setImages] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name: "",
        category: '',
        prices: {
            USD: { oldprice: '', newprice: '' },
            EUR: { oldprice: '', newprice: '' },
            PKR: { oldprice: '', newprice: '' },
            GBP: { oldprice: '', newprice: '' },
            AED: { oldprice: '', newprice: '' }
        },
        description: '',
        brand: '',
        colors: [],  // Array of objects: { color: 'value', available: boolean }
        sizes: [],   // Array of objects: { size: 'value', available: boolean }
        available: true,  // Product availability
        visible: false
    });
    const [tempColor, setTempColor] = useState("");
    const [tempSize, setTempSize] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Handle changes in the form fields
    const changeHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setProductDetails(prevDetails => ({
            ...prevDetails,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle price updates
    const pricesChangeHandler = (e, currency, priceType) => {
        const { value } = e.target;
        setProductDetails(prevDetails => ({
            ...prevDetails,
            prices: {
                ...prevDetails.prices,
                [currency]: {
                    ...prevDetails.prices[currency],
                    [priceType]: value
                }
            }
        }));
    };

    // Handle array fields (sizes, colors)
    const arrayHandler = (e, field) => {
        const value = e.target.value.split(',').map(item => item.trim());
        setProductDetails(prevDetails => ({
            ...prevDetails,
            [field]: value
        }));
    };

    // Add color to the list
    const addColor = () => {
        if (tempColor) {
            setProductDetails(prevDetails => ({
                ...prevDetails,
                colors: [...prevDetails.colors, { color: tempColor, available: true }]  // default available = true
            }));
            setTempColor(""); // Reset tempColor
        }
    };

    // Add size to the list
    const addSize = () => {
        if (tempSize) {
            setProductDetails(prevDetails => ({
                ...prevDetails,
                sizes: [...prevDetails.sizes, { size: tempSize, available: true }]  // default available = true
            }));
            setTempSize(""); // Reset tempSize
        }
    };

    // Handle image uploads
    const imageHandler = (e) => {
        setImages(Array.from(e.target.files));
    };

    // Handle form submission and adding the product
    const addProduct = async () => {
        setLoading(true);
        setErrorMessage("");

        // Validate form data
        if (!productDetails.name || !productDetails.category || !productDetails.description || images.length === 0) {
            setErrorMessage("Please fill in all required fields and upload at least one image.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        images.forEach(image => {
            formData.append('images', image);
        });

        const product = {
            ...productDetails,
            images: [] // Placeholder for images that will be updated after upload
        };

        Object.entries(product).forEach(([key, value]) => {
            formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
        });

        try {
            // Upload images
            const uploadResponse = await fetch(`${baseurl}/uploadimage`, {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadResponse.json();

            if (uploadData.success) {
                product.images = uploadData.data.map(img => img.secure_url); // Update images with uploaded URLs

                // Add product to the database
                const addProductResponse = await fetch(`${baseurl}/addproduct`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'auth-token': sessionStorage.getItem('auth-token'),
                    },
                    body: JSON.stringify(product),
                });

                const data = await addProductResponse.json();

                if (data.success) {
                    alert("Product added successfully");
                    window.location.reload();
                } else {
                    setErrorMessage("Failed to add product");
                }
            } else {
                setErrorMessage("Failed to upload images");
            }
        } catch (error) {
            setErrorMessage('Error occurred while uploading the images or adding the product');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product">
            <div className="addproduct-itemfield">
                <label>Product Title</label>
                <input
                    value={productDetails.name}
                    onChange={changeHandler}
                    type="text"
                    name='name'
                    placeholder='Type here'
                />
            </div>

            <div className="addproduct-price">
                {['USD', 'EUR', 'PKR', 'GBP', 'AED'].map(currency => (
                    <div className="addproduct-itemfield" key={currency}>
                        <label>{currency} - Old Price</label>
                        <input
                            value={productDetails.prices[currency].oldprice}
                            onChange={(e) => pricesChangeHandler(e, currency, 'oldprice')}
                            type="text"
                            placeholder={`Old price in ${currency}`}
                        />
                        <label>{currency} - New Price</label>
                        <input
                            value={productDetails.prices[currency].newprice}
                            onChange={(e) => pricesChangeHandler(e, currency, 'newprice')}
                            type="text"
                            placeholder={`New price in ${currency}`}
                        />
                    </div>
                ))}
            </div>

            <div className="addproduct-itemfield">
                <label>Description</label>
                <textarea
                    rows={5}
                    value={productDetails.description}
                    onChange={changeHandler}
                    name="description"
                    placeholder='Description'
                />
            </div>

            <div className="addproduct-itemfield">
                <label>Product Category</label>
                <select
                    value={productDetails.category}
                    onChange={changeHandler}
                    name='category'
                    className='add-product-selector'
                >
                    <option value='men shoes'>Men Shoes</option>
                    <option value='women shoes'>Women Shoes</option>
                    <option value='perfumes'>Perfumes</option>
                    <option value='cosmetics'>Cosmetics</option>
                    <option value='bags'>Bags</option>
                    <option value='accessories'>Accessories</option>
                    <option value='belts'>Belts</option>
                    <option value='wallets'>Wallets</option>
                    <option value='horse saddle'>Horse Saddle</option>
                </select>
            </div>

            {/* Row for Brand and Colors */}
            <div className="addproduct-row">
                <div className="addproduct-itemfield">
                    <label>Brand</label>
                    <input
                        value={productDetails.brand}
                        onChange={changeHandler}
                        type="text"
                        name='brand'
                        placeholder='Brand'
                    />
                </div>

                <div className="addproduct-itemfield">
                    <label>Colors</label>
                    <div className="color-picker-wrapper">
                        {productDetails.colors.map((color, index) => (
                            <div key={index} className="color-preview" style={{ backgroundColor: color.color }} />
                        ))}
                        <input
                            type="color"
                            value={tempColor}
                            onChange={(e) => setTempColor(e.target.value)}
                        />
                        <button
                            className="color-ok-btn"
                            onClick={addColor}
                            disabled={!tempColor}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>

            {/* Row for Sizes */}
            <div className="addproduct-row">
                <div className="addproduct-itemfield">
                    <label>Sizes</label>
                    <input
                        value={tempSize}
                        onChange={(e) => setTempSize(e.target.value)}
                        type="text"
                        placeholder="Enter size (eg, S/45)"
                    />
                    <button
                        onClick={addSize}
                        disabled={!tempSize}
                    >
                        Add Size
                    </button>
                </div>
            </div>

            {/* Row for Visibility */}
            <div className="addproduct-row2">
                <div className="addproduct-itemfield2">
                    <label>Visibility</label>
                    <input
                        type="checkbox"
                        name="visible"
                        checked={productDetails.visible}
                        onChange={changeHandler}
                    />
                </div>
            </div>

            {/* Row for Availability */}
            <div className="addproduct-row2">
                <div className="addproduct-itemfield2">
                    <label>Available</label>
                    <input
                        type="checkbox"
                        name="available"
                        checked={productDetails.available}
                        onChange={changeHandler}
                    />
                </div>
            </div>

            <div className="addproduct-itemfield">
                <div className="image-previews">
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img key={index} src={URL.createObjectURL(image)} alt={`Product Preview ${index + 1}`} />
                        ))
                    ) : (
                        <p>No images selected</p>
                    )}
                </div>
                <label htmlFor='file-input' className='upload-box'>
                    <IoMdCloudUpload size={20} />
                    Upload images
                </label>
                <input
                    type='file'
                    name='images'
                    id='file-input'
                    onChange={imageHandler}
                    multiple
                    hidden
                />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="btn-div">
                <button onClick={addProduct} disabled={loading} className='addproduct-btn'>
                    {loading ? "Adding..." : "Add Product"}
                </button>
            </div>
        </div>
    );
};

export default Addproduct;
