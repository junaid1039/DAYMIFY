import React, { useState, useEffect, useContext, useCallback } from 'react';
import './adminorders.css';
import Orderdetails from '../orderdetails/Orderdetails';
import { LuPencilLine } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Context } from '../../context API/Contextapi';
import Adminloader from '../adminloader/Adminloader';

const AdminOrders = () => {
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const { fetchOrders } = useContext(Context);
    const [orders, setOrders] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleteInput, setDeleteInput] = useState('');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const ordersData = await fetchOrders();
            setOrders(ordersData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const viewOrderDetails = (id) => {
        setSelectedOrderId(id);
    };

    const closeOrderDetails = () => {
        setSelectedOrderId(null);
    };

    const confirmDeleteOrder = (id) => {
        setOrderToDelete(id);
        setShowConfirmDelete(true);
        setDeleteInput(''); // Reset input field when the modal opens
    };

    const deleteOrder = async () => {
        if (!orderToDelete) return;
        setDeleting(true);
        try {
            const response = await fetch(`${baseurl}/delorder/${orderToDelete}`, {
                method: 'DELETE',
                headers: {
                    'auth-token': `${sessionStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const ordersData = await fetchOrders();
                    setOrders(ordersData);
                } else {
                    setError('Failed to delete the order');
                }
            } else {
                setError('Failed to delete the order');
            }
        } catch (error) {
            setError('Error deleting the order: ' + error.message);
        } finally {
            setDeleting(false);
            setShowConfirmDelete(false);
            setOrderToDelete(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Processing':
                return 'status-processing';
            case 'Shipped':
                return 'status-shipped';
            case 'Delivered':
                return 'status-delivered';
            case 'Cancelled':
                return 'status-cancelled';
            case 'Completed':
                return 'status-completed';
            default:
                return '';
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const ordersData = await fetchOrders();
            setOrders(ordersData);
        } catch (error) {
            setError('Failed to update orders');
        }
    };

    if(loading){
        return (
            <Adminloader/>
        )
    }

    return (
        <div className="admin-orders-container">
            <h2 className="admin-orders-title">Order Management</h2>
            <table className="admin-orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Order Status</th>
                        <th>Total Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order._id} className="table-row">
                                <td>{order.orderId}</td>
                                <td>{new Date(order.dateOrdered).toLocaleString()}</td>
                                <td className="status-cell">
                                    <span className={getStatusClass(order.orderStatus)}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td>PKR {order.totalPrice.toFixed(2)}</td>
                                <td className='m-o-db'>
                                    <button onClick={() => viewOrderDetails(order.orderId)} className="o-db">
                                        <LuPencilLine />
                                    </button>
                                    <button onClick={() => confirmDeleteOrder(order.orderId)} className="o-db" disabled={deleting}>
                                        <RiDeleteBin6Line />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No orders available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedOrderId && (
                <div className="order-details-container">
                    <Orderdetails oid={selectedOrderId} onClose={closeOrderDetails} onStatusUpdate={handleStatusUpdate} />
                </div>
            )}

            {showConfirmDelete && (
                <div className="confirm-delete-overlay">
                    <div className="confirm-delete-modal">
                        <h3>Confirm Deletion</h3>
                        <p>To confirm deletion, please type <strong>delete</strong> in the box below:</p>
                        <input
                            type="text"
                            placeholder="Type 'delete' to confirm"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button
                                className="confirm-button"
                                onClick={deleteOrder}
                                disabled={deleteInput.toLowerCase() !== 'delete'}
                            >
                                Confirm
                            </button>
                            <button
                                className="cancel-button"
                                onClick={() => setShowConfirmDelete(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
