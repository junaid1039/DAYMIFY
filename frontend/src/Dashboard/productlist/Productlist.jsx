import React, { useState, useEffect, useContext } from 'react';
import './productlist.css';
import { RiDeleteBin5Line, RiEdit2Fill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context API/Contextapi';
import Adminloader from '../adminloader/Adminloader';

const Productlist = () => {
  const { confirmDelete, fnadminproducts } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [Adminproducts, setAdminProducts] = useState([]); // State for products

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await fnadminproducts(); // Fetch products
        setAdminProducts(products.data.products); // Set products in state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []); // Dependency on fnadminproducts

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await confirmDelete(productToDelete); // Delete the product
      setShowModal(false);
      // Optionally refresh the product list
      const products = await fnadminproducts(); // Fetch updated product list
      setAdminProducts(products); // Update state with new products
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <Adminloader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div className="list-product">
      <h1>All Products</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {Adminproducts.length === 0 ? (
          <p>No products available</p>
        ) : (
          Adminproducts.map((product) => (
            <React.Fragment key={product.id}>
              <div className="listproduct-format-main listproduct-format">
                <img 
                  src={product.images.length > 0 ? product.images[0] : 'default-image-url.jpg'} 
                  alt={product.name} 
                  className="listproduct-product-img" 
                />
                <p>{product.name}</p>
                <p>{product.prices["PKR"].oldprice}</p>
                <p>{product.prices["PKR"].newprice}</p>
                <p>{product.category}</p>
                <p>
                  <RiEdit2Fill onClick={() => navigate(`editproduct/${product.id}`)} className="edit-icon" />
                  <RiDeleteBin5Line onClick={() => handleDeleteClick(product.id)} className="delete-icon" />
                </p>
              </div>
              <hr />
            </React.Fragment>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this product?</p>
            <div className="confirm-buttons">
              <button onClick={handleConfirmDelete} className="confirm-btn">Yes</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productlist;
