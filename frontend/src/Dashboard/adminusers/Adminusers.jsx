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
    const [editUser, setEditUser] = useState({ name: '', email: '', role: '' });
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

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
    }, [fetchUsers]);

    // Edit function
    const handleEditClick = useCallback((user) => {
        if (user.role === "Owner") {
            alert("You cannot edit the role or details of an owner.");
            return;
        }
        setEditingUserId(user._id);
        setEditUser({ name: user.name, email: user.email, role: user.role });
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
        try {
            const res = await fetch(`${baseurl}/deleteuser/${confirmDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${sessionStorage.getItem('auth-token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUsers((prevUsers) => prevUsers.filter(user => user._id !== confirmDeleteId));
            } else {
                console.error('Error deleting user:', data.message);
            }
            setConfirmDeleteId(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }, [baseurl, confirmDeleteId]);

    const cancelDelete = useCallback(() => {
        setConfirmDeleteId(null);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditUser((prev) => ({ ...prev, [name]: value }));
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
                    <p>Are you sure you want to delete?</p>
                    <button onClick={confirmDelete} className="confirm-button">Yes</button>
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
                    </select>
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

