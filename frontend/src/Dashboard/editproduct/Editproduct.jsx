import React, { useState, useEffect } from 'react';
import '../addproduct/addproduct.css';
import { IoMdCloudUpload } from "react-icons/io";
import { RiCloseCircleLine } from 'react-icons/ri';
import { useParams, useNavigate } from 'react-router-dom';

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const EditProduct = () => {
    const { id } = useParams(); 
    const navigate = useNavigate(); 
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
        colors: [],
        sizes: [],
        visible: false
    });
    const [images, setImages] = useState([]); 
    const [existingImages, setExistingImages] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletedImages, setDeletedImages] = useState([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`${baseurl}/productdata/${id}`);
                const data = await response.json();
                if (data.success) {
                    const product = data.product;
                    
                    setProductDetails({
                        name: product.name,
                        category: product.category,
                        prices: {
                            USD: { oldprice: product.prices?.USD?.oldprice || '', newprice: product.prices?.USD?.newprice || '' },
                            EUR: { oldprice: product.prices?.EUR?.oldprice || '', newprice: product.prices?.EUR?.newprice || '' },
                            PKR: { oldprice: product.prices?.PKR?.oldprice || '', newprice: product.prices?.PKR?.newprice || '' },
                            GBP: { oldprice: product.prices?.GBP?.oldprice || '', newprice: product.prices?.GBP?.newprice || '' },
                            AED: { oldprice: product.prices?.AED?.oldprice || '', newprice: product.prices?.AED?.newprice || '' },
                        },
                        description: product.description,
                        brand: product.brand || '',
                        colors: product.colors || [],
                        sizes: product.sizes || [],
                        visible: product.visible || false,
                    });
                    setExistingImages(product.images || []); 
                } else {
                    throw new Error(data.message || 'Failed to fetch product details');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setErrorMessage(error.message);
            }
        };
        fetchProductDetails();
    }, [id]);
    
    const changeHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setProductDetails(prevDetails => ({
            ...prevDetails,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

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

    const arrayHandler = (e, fieldName) => {
        setProductDetails({
            ...productDetails,
            [fieldName]: e.target.value.split(',').map(item => item.trim())
        });
    };

    const imageHandler = (e) => {
        setImages(prevImages => [...prevImages, ...Array.from(e.target.files)]);
    };

    const removeExistingImage = (imageUrl) => {
        setDeletedImages([...deletedImages, imageUrl]);
        setExistingImages(existingImages.filter(img => img !== imageUrl));
    };

    const uploadImages = async (formData) => {
        try {
            const uploadResponse = await fetch(`${baseurl}/uploadimage`, {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                return uploadData.data.map(img => img.secure_url);
            } else {
                throw new Error('Failed to upload images');
            }
        } catch (error) {
            throw new Error('Error occurred while uploading images');
        }
    };

    const editProduct = async () => {
        setLoading(true);
        setErrorMessage("");

        const formData = new FormData();
        images.forEach(image => formData.append('images', image));

        try {
            let uploadedImageUrls = [];
            if (images.length > 0) {
                uploadedImageUrls = await uploadImages(formData);
            }

            const product = {
                ...productDetails,
                images: [...uploadedImageUrls, ...existingImages.filter(img => !deletedImages.includes(img))],
            };

            const response = await fetch(`${baseurl}/product/${id}`, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': sessionStorage.getItem('auth-token'),
                },
                body: JSON.stringify(product),
            });

            const data = await response.json();
            if (data.success) {
                alert("Product updated successfully");
                navigate('/admin/productlist');
            } else {
                throw new Error(data.message || 'Failed to update product');
            }
        } catch (error) {
            setErrorMessage(error.message);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product">
            <h2>Edit Product</h2>
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
                    <label>Colors (comma-separated)</label>
                    <input
                        value={productDetails.colors.join(', ')}
                        onChange={(e) => arrayHandler(e, 'colors')}
                        type="text"
                        placeholder='e.g., red, blue, green'
                    />
                </div>
            </div>
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
            <div className="addproduct-itemfield">
                <label>Sizes (comma-separated)</label>
                <input
                    value={productDetails.sizes.join(', ')}
                    onChange={(e) => arrayHandler(e, 'sizes')}
                    type="text"
                    placeholder='e.g., S, M, L'
                />
            </div>
            <div className="addproduct-itemfield">
                <label>Existing Images</label>
                <div className="image-preview-container">
                    {existingImages.length > 0 ? (
                        existingImages.map((image, index) => (
                            <div key={index} className="image-preview-edit">
                                <img src={image} alt={`Existing Image ${index + 1}`} />
                                <RiCloseCircleLine className="remove-icon" onClick={() => removeExistingImage(image)} />
                            </div>
                        ))
                    ) : (
                        <p>No existing images available.</p>
                    )}
                </div>
            </div>
            <div className="btn-div">
                <label>Upload Images</label>
                <input
                    type="file"
                    onChange={imageHandler}
                    accept="image/*"
                    multiple
                />
                <p><IoMdCloudUpload /> Drag & Drop your images or click to upload</p>
            </div>
            {loading && <p>Loading...</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={editProduct}>Update Product</button>
        </div>
    );
};

export default EditProduct;
