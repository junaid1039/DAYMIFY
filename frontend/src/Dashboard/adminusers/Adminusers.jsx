import React, { useState, useEffect, useContext, useCallback } from 'react';
import './adminusers.css';
import { LuPencilLine } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TiTickOutline } from "react-icons/ti";
import { BiX } from "react-icons/bi";
import { Context } from '../../context API/Contextapi';

const AdminUsers = () => {
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const { fetchUsers } = useContext(Context);
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editUser, setEditUser] = useState({ name: '', email: '', role: '', allowComponents: [] });
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState(""); // State for delete confirmation text
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const components = [
        'Addproduct', 'AdminCarousel', 'AdminDashboard', 'AdminNews', 'AdminPromoCode',
        'AdminQueries', 'AdminUsers', 'AdminOrders', 'Editproduct', 'Orderdetails', 'AdminPopup',
        'Productlist', 'Feedbacks'
    ];

    const memoizedFetchUsers = useCallback(fetchUsers, []);

    // Fetch users from backend
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const userData = await fetchUsers();
                setUsers(userData);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [memoizedFetchUsers]);

    // Edit function
    const handleEditClick = useCallback((user) => {
        if (user.role === "Owner") {
            alert("You cannot edit the role or details of an owner.");
            return;
        }
        setEditingUserId(user._id);
        setEditUser({
            name: user.name,
            email: user.email,
            role: user.role,
            allowComponents: user.allowComponents || []
        });
    }, []);

    // Delete function
    const handleDeleteClick = useCallback((id, role) => {
        if (role === "Owner") {
            alert("You cannot delete an owner.");
            return;
        }
        setConfirmDeleteId(id);
    }, []);

    // Delete API
    const confirmDelete = useCallback(async () => {
        if (deleteConfirmationText.toLowerCase() !== "delete") {
            alert("Please type 'delete' to confirm.");
            return;
        }

        try {
            const res = await fetch(`${baseurl}/deleteuser/${confirmDeleteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": `${sessionStorage.getItem("auth-token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== confirmDeleteId));
            } else {
                console.error("Error deleting user:", data.message);
            }
            setConfirmDeleteId(null);
            setDeleteConfirmationText(""); // Reset the confirmation text
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }, [baseurl, confirmDeleteId, deleteConfirmationText]);

    const cancelDelete = useCallback(() => {
        setConfirmDeleteId(null);
        setDeleteConfirmationText(""); // Reset the confirmation text
    }, []);

    const handleDeleteInputChange = useCallback((e) => {
        setDeleteConfirmationText(e.target.value);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Handle checkbox change for components
    const handleComponentChange = useCallback((e) => {
        const { value, checked } = e.target;
        setEditUser((prev) => {
            const newComponents = checked
                ? [...prev.allowComponents, value]
                : prev.allowComponents.filter((component) => component !== value);
            return { ...prev, allowComponents: newComponents };
        });
    }, []);

    // User info change API
    const handleSaveClick = useCallback(async () => {
        try {
            const res = await fetch(`${baseurl}/updateuserdetails/${editingUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${sessionStorage.getItem('auth-token')}`,
                },
                body: JSON.stringify(editUser),
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prevUsers) => prevUsers.map(user => user._id === editingUserId ? data.user : user));
                setEditingUserId(null);
            } else {
                console.error('Error updating user:', data.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }, [baseurl, editingUserId, editUser]);

    const handleCancelClick = useCallback(() => {
        setEditingUserId(null);
    }, []);

    // Render loading state or error state if applicable
    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="admin-users-container">
            <h2 className="admin-users-title">User Management</h2>
            <table className="admin-users-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="table-row">
                            <td>{user.userId}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    onClick={() => handleEditClick(user)}
                                    className={`o-db ${user.role === "Owner" ? "disabled" : ""}`}
                                    disabled={user.role === "Owner"}
                                >
                                    <LuPencilLine />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(user._id, user.role)}
                                    className={`o-db ${user.role === "Owner" ? "disabled" : ""}`}
                                    disabled={user.role === "Owner"}
                                >
                                    <RiDeleteBin6Line />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Confirmation Dialog */}
            {confirmDeleteId && (
                <div className="confirm-delete">
                    <p>Are you sure you want to delete this user? Type "delete"</p>
                    <input
                        type="text"
                        value={deleteConfirmationText}
                        onChange={handleDeleteInputChange}
                        placeholder='Type "delete" to confirm'
                    />
                    <button
                        onClick={confirmDelete}
                        className="confirm-button"
                        disabled={deleteConfirmationText.toLowerCase() !== "delete"}
                    >
                        Yes
                    </button>
                    <button onClick={cancelDelete} className="cancel-button">No</button>
                </div>
            )}

            {/* Edit Modal */}
            {editingUserId && (
                <div className="edit-modal">
                    <h3>Edit User</h3>
                    <label>Name:</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={editUser.name} 
                        onChange={handleInputChange} 
                    />
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={editUser.email} 
                        onChange={handleInputChange} 
                    />
                    <label>Role:</label>
                    <select name="role" value={editUser.role} onChange={handleInputChange}>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Marketer">Marketer</option>
                        <option value="Shipper">Shipper</option>
                        <option value="Auditor">Auditor</option>
                    </select>
                    
                    {/* Components Selection */}
                    <label>Components:</label>
                    <div className="components-selection">
                        {components.map((component) => (
                            <div key={component}>
                                <input
                                    type="checkbox"
                                    value={component}
                                    checked={editUser.allowComponents.includes(component)}
                                    onChange={handleComponentChange}
                                />
                                <label>{component}</label>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={handleSaveClick} className="save-button">
                        <TiTickOutline /> Save
                    </button>
                    <button onClick={handleCancelClick} className="cancel-button">
                        <BiX /> Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
