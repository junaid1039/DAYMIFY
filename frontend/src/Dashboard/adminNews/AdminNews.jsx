import React, { useEffect, useState } from "react";
import "./adminnews.css"; // Create a CSS file for admin styling

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const AdminNews = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch subscribers from the backend
    const fetchSubscribers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${baseurl}/subscribers`);
            const data = await response.json();
            if (response.ok) {
                setSubscribers(data);
                console.log(data);
            } else {
                setError(data.message || "Failed to fetch subscribers.");
            }
        } catch (err) {
            setError("An error occurred while fetching subscribers.");
        } finally {
            setLoading(false);
        }
    };

    // Delete a subscriber with confirmation
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this subscriber?")) {
            try {
                const response = await fetch(`${baseurl}/delsubscriber/${id}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setSubscribers(subscribers.filter((subscriber) => subscriber._id !== id));
                } else {
                    alert("Failed to delete subscriber.");
                }
            } catch (err) {
                console.error("Error deleting subscriber:", err);
                alert("An error occurred while deleting.");
            }
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    return (
        <div className="admin">
            <h1>Newsletter Subscribers</h1>
            {loading && <p>Loading subscribers...</p>}
            {error && <p className="admin__error">{error}</p>}
            {!loading && !error && subscribers.length === 0 && <p>No subscribers found.</p>}
            {!loading && !error && subscribers.length > 0 && (
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((subscriber) => (
                            <tr key={subscriber._id}>
                                <td>{subscriber.name}</td>
                                <td>{subscriber.email}</td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(subscriber._id)}
                                        className="admin__delete-button"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminNews;
