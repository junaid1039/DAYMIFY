import React, { useEffect, useState, useContext } from 'react';
import './admincarousel.css';
import { Context } from '../../context API/Contextapi';

const AdminCarousel = () => {
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
    const { fetchCarousels } = useContext(Context);
    const [carousels, setCarousels] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const loadCarousels = async () => {
            const fetchedCarousels = await fetchCarousels();
            setCarousels(fetchedCarousels);
        };
        loadCarousels();
    }, [fetchCarousels]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imageFiles.length === 0) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        imageFiles.forEach((file) => {
            formData.append('image', file);
        });

        setLoading(true);
        try {
            const uploadResponse = await fetch(`${baseurl}/uploadcarousel`, {
                method: 'POST',
                headers: {
                    'auth-token': sessionStorage.getItem('auth-token'),
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
                const secureUrl = uploadData.data.secure_url;

                const postResponse = await fetch(`${baseurl}/postcarousel`, {
                    method: 'POST',
                    headers: {
                        'auth-token': sessionStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        carousel: secureUrl,
                        linkto: selectedOption,
                        subcategory: subcategory,
                        title: title,
                        description: description,
                    }),
                });

                const postData = await postResponse.json();
                if (postData.success) {
                    setImageFiles([]);
                    setTitle('');
                    setDescription('');
                    setSubcategory('');
                    setSelectedOption('');
                    setEditId(null);
                    setLoading(false);

                    const fetchedCarousels = await fetchCarousels();
                    setCarousels(fetchedCarousels);
                } else {
                    alert(postData.message);
                    setLoading(false);
                }
            } else {
                alert("Error uploading image:", uploadData.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error submitting carousel:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carousel entry?')) {
            try {
                const response = await fetch(`${baseurl}/delcarousel`, {
                    method: 'DELETE',
                    headers: {
                        'auth-token': sessionStorage.getItem('auth-token'),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });

                const data = await response.json();
                if (data.success) {
                    const fetchedCarousels = await fetchCarousels();
                    setCarousels(fetchedCarousels);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error deleting carousel:', error);
            }
        }
    };

    return (
        <div className="admin-carousel-container">
            <h1>Carousel Management</h1>
            <form onSubmit={handleSubmit}>
                <label>Image Dimensions (1920 x 1080)</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    required
                />
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                >
                    <option value="">Subcategory/Optional</option>
                    <option value="/bags">Bags</option>
                    <option value="/belts">Belts</option>
                    <option value="/women shoes">Women Shoes</option>
                    <option value='/cosmetics'>Cosmetics</option>
                    <option value="/wallets">Wallets</option>
                    <option value="/men shoes">Men Shoes</option>
                    <option value="/horse saddle">Horse Saddle</option>
                    <option value="/accessories">Accessories</option>
                    <option value="/perfumes">Perfumes</option>
                </select>
                <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)} // Correct handler for link to
                    required
                >
                    <option value="">Link to</option>
                    <option value="/bags">Bags</option>
                    <option value="/belts">Belts</option>
                    <option value="/women shoes">Women Shoes</option>
                    <option value='/cosmetics'>Cosmetics</option>
                    <option value="/wallets">Wallets</option>
                    <option value="/men shoes">Men Shoes</option>
                    <option value="/horse saddle">Horse Saddle</option>
                    <option value="/accessories">Accessories</option>
                    <option value="/perfumes">Perfumes</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : editId ? 'Update Carousel' : 'Add Carousel'}
                </button>
            </form>

            <h2>Carousel Entries</h2>
            <ul>
                {carousels.map((carousel) => (
                    <li key={carousel._id}>
                        <img src={carousel.carousel} alt={`Carousel ${carousel._id}`} className="carousel-image" />
                        <div>
                            <h3>{carousel.title}</h3>
                            <p>{carousel.description}</p>
                            {carousel.subcategory && <p><strong>Subcategory:</strong> {carousel.subcategory}</p>}
                        </div>
                        <button onClick={() => handleDelete(carousel._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminCarousel;
