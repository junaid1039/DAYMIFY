import React, { createContext, useState, useEffect } from 'react';
export const Context = createContext(null);

const getStoredCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : {};  // Returns stored cart or an empty object
};

const ContextProvider = (props) => {


    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    const [cart, setCart] = useState(getStoredCart());
    // const [cartItems, setCartItems] = useState(getdefaultcart());
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const [shippingInfo, setShippingInfo] = useState(null);
    const [allproducts, setAllProducts] = useState([]);
    const [Adminproducts, setAdminproducts] = useState([]);
    const [countryCode, setCountryCode] = useState();
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        // Store cart in localStorage whenever it updates
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        fetchCartItems();
    }, [baseurl]);

    const fetchCartItems = async () => {
        const token = sessionStorage.getItem('auth-token');
        if (token) {
            try {
                const response = await fetch(`${baseurl}/getcart`, {
                    method: 'POST',
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }
                const data = await response.json();
                setCart(data); // Set cart state directly from the response
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        }
    };

    //add To cart 


    const addToCart = (productId, color = null, size = null, quantity = 1) => {
        setCart((prevCart) => {
            const newCart = { ...prevCart };
            if (newCart[productId]) {
                newCart[productId].quantity += quantity;
            } else {
                // Add the product with initial quantity and selected details
                newCart[productId] = {
                    quantity,
                    color,
                    size,
                };
            }
            return newCart;
        });
    };




    //cart remove

    const removeFromCart = (productId, removeAll = false) => {
        setCart((prevCart) => {
            const newCart = { ...prevCart };

            if (removeAll || newCart[productId].quantity <= 1) {
                // Remove the entire item from the cart if removeAll is true or quantity is 1
                delete newCart[productId];
            } else {
                // Otherwise, decrease the quantity by 1
                newCart[productId].quantity -= 1;
            }

            return newCart;
        });
    };


    const getTotalCartItems = () => {
        return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
    };

    //promocode
    const applyPromoCode = async (code) => {
        const token = sessionStorage.getItem('auth-token');
        try {
            const response = await fetch(`${baseurl}/validateCode`, {
                method: 'POST',
                headers: {
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ promoCode: code }),
            });
    
            const data = await response.json();
            if (data.success) {
                setPromoCode(code);
                setDiscount(data.discount); // Assuming the server returns the discount
            } else {
                alert(data.message); // Show error message if promocode is invalid
            }
        } catch (error) {
            console.error('Error applying promocode:', error);
            alert('Failed to apply promocode');
        }
    };
    

    const getTotalCartAmount = () => {
        if (!allproducts || !cart) return 0; // Safe check
    
        // Calculate the total price as before
        const total = Object.entries(cart).reduce((total, [productId, { quantity }]) => {
            const product = allproducts.find((p) => p.id === parseInt(productId));
            if (product) {
                total += product.newprice * quantity;
            }
            return total;
        }, 0);
    
        // Apply the discount if any
        const discountedTotal = Math.round(total - (total * (discount / 100)));
        return discountedTotal; // Return the total after discount
    };
    

    //userinfo fetch

    const userinfo = async () => {
        const token = sessionStorage.getItem('auth-token');
        const userId = sessionStorage.getItem('userId');

        if (!token || !userId) {
            return null; // Return null immediately if token or userId is missing
        }

        try {
            const response = await fetch(`${baseurl}/userdetails/${userId}`, {
                method: 'GET',
                headers: {
                    'auth-token': token,
                    'Content-Type': 'application/json',
                },
            });

            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // Check if the response indicates success
            return data.success ? data.user : null;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null; // Return null if an error occurs
        }
    };


    const myorders = async () => {
        const userId = sessionStorage.getItem('userId');

        return fetch(`${baseurl}/myorders/${userId}`, {
            method: 'GET',
            headers: {
                'auth-token': sessionStorage.getItem('auth-token'),
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 404) {
                        return [];
                    }
                    throw new Error(`Error fetching orders: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.success && Array.isArray(data.orders)) {
                    return data.orders; // Return the orders if the response is successful
                } else {
                    throw new Error('Expected data to contain an orders array');
                }
            })
            .catch(() => {
                return []; // Return an empty array in case of error
            });
    };


    const login = async (formData, navigate) => { // Accept formData as a parameter
        try {
            const response = await fetch(`${baseurl}/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Use the passed formData
            });

            const responsedata = await response.json();

            if (responsedata.success) {
                setisLoggedIn(true);
                sessionStorage.setItem('auth-token', responsedata.token);
                sessionStorage.setItem('userId', responsedata.userId);

                navigate('/');  // Redirect to the home page after login
            } else {
                alert(responsedata.message);
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };


    //signup
    const signup = async (formData, navigate) => {
        try {
            const response = await fetch(`${baseurl}/signup`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responsedata = await response.json();

            if (responsedata.success) {
                setisLoggedIn(true);
                sessionStorage.setItem('auth-token', responsedata.token);
                navigate('/');  // Redirect to the home page after signup
            } else {
                alert(responsedata.err);
            }
        } catch (error) {
            console.error("Error during signup:", error);
            alert("An error occurred while signing up. Please try again.");
        }
    };

    const handleLogout = (navigate) => {
        sessionStorage.removeItem("auth-token");
        setisLoggedIn(false);
        navigate("/account");  // Redirect to the account/login page after logout
    };

    //shiping info
    const handleShippingSubmit = (info) => {
        setShippingInfo(info); // Save shipping info in context
        // navigate('/payment'); // Navigate to payment page after shipping info is submitted
    };
    //handle paymentsubmit
    // Handle Payment Submit (fixed)
    const handlePaymentSubmit = (navigate, setError, paymentMethod) => {
        if (!paymentMethod) {
            setError('Please select a payment method to proceed.');
            return;
        }
        if (!shippingInfo) {
            setError('Shipping info is required.');
            return;
        }
        setError(''); // Clear previous errors
    
        const userIdFromSession = sessionStorage.getItem('userId');
        const userId = userIdFromSession || null; // Use `null` if no user ID is available
    
        if (!userIdFromSession) {
            console.warn("User is placing an order without logging in.");
        }
    
        const orderData = {
            user: userId, // Null if user is not logged in
            orderItems: Object.keys(cart).map(itemId => {
                const quantity = cart[itemId].quantity;
                const productInfo = allproducts.find(product => product.id === Number(itemId));
                return {
                    product: productInfo ? productInfo._id : null,
                    productId: productInfo ? productInfo.id : '', 
                    name: productInfo ? productInfo.name : '',
                    quantity,
                    price: productInfo ? productInfo.newprice : 0,
                    image: productInfo ? productInfo.images[0] : '',
                    color: cart[itemId]?.color,
                    size: cart[itemId]?.size,
                };
            }).filter(item => item.product !== null && item.quantity > 0),
            shippingInfo: shippingInfo,
            paymentInfo: {
                method: paymentMethod,
                id: '123', // Dummy value for now
                status: 'COD',
                paidAt: Date.now()
            },
            orderStatus: 'Processing',
            totalPrice: getTotalCartAmount(),
            shippingPrice: 0,
            dateOrdered: Date.now()
        };
    
        fetch(`${baseurl}/confirmorder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    navigate('/ordersuccess');
                } else {
                    console.log("Failed to confirm order", data.message || data);
                }
            })
            .catch(error => {
                console.error("Error while confirming the order:", error);
                alert('Error while confirming the order.');
            });
    };
    
    


    useEffect(() => {
        fetchInfo();
    }, []);
    // Fetch all products
    const fetchUserIP = async () => {
        try {
            const response = await fetch('https://ipinfo.io/json');  // Fetch user's IP from external service
            const data = await response.json();
            setCountryCode(data.country);
            return data.country;

        } catch (error) {
            console.error('Error fetching IP:', error);
            return null;
        }
    };

    const fetchInfo = async () => {
        try {
            // Get the user's IP address
            const countryCode = await fetchUserIP();
            // Construct the API request with IP in query params
            const url = countryCode ? `${baseurl}/allproducts?countryCode=${countryCode}` : `${baseurl}/allproducts`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            setAllProducts(data.products); // Set products state

            return { success: true }; // Explicitly return success
        } catch (error) {
            setAllProducts([]); // Clear products if fetch fails
            return { success: false, error: error.message }; // Return success false with error
        }
    };


    //Admin allproducts

    const fnadminproducts = async () => {
        try {
            const response = await fetch(`${baseurl}/adminproducts`, {
                headers: {
                    'auth-token': sessionStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            setAdminproducts(data.products || []);
            return { success: true, data };
        } catch (error) {
            console.error("Error fetching products:", error.message);
            setAdminproducts([]);
            return { success: false, error: error.message };
        }
    };

//confirm detete function
    const confirmDelete = async (productToDelete) => {
        try {
            const response = await fetch(`${baseurl}/removeproduct`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'auth-token': `${sessionStorage.getItem('auth-token')}`,
                },
                body: JSON.stringify({ id: productToDelete }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
    
            const updatedProducts = await fnadminproducts(); // Fetch updated product list
            return updatedProducts; // Return the updated products to the caller
        } catch (error) {
            console.error('Failed to remove product:', error);
            throw error; // Let the caller handle the error
        }
    };
    


    //fetch orders

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${baseurl}/allorders`, {
                method: 'GET',
                headers: {
                    'auth-token': `${sessionStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.orders; // Return the fetched orders
                } else {
                    throw new Error('Failed to fetch orders');
                }
            } else {
                throw new Error('Failed to fetch orders');
            }
        } catch (error) {
            throw new Error('Error fetching orders: ' + error.message);
        }
    };


    ///fetch users
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${baseurl}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${sessionStorage.getItem('auth-token')}`
                }
            });
            const data = await res.json();
            if (data.success) {
                return data.users; // Return user data here
            } else {
                console.error('Error fetching users:', data.message);
                return []; // Return an empty array on error
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return []; // Return an empty array on error
        }
    };

    // Fetch all carousel entries
    const fetchCarousels = async () => {
        try {
            const response = await fetch(`${baseurl}/getcarousel`, {
                method: 'GET',
                headers: {
                    'auth-token': sessionStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                return data.carousels;
            } else {
                console.error('Failed to fetch carousels:', data.message);
            }
        } catch (error) {
            console.error('Error fetching carousels:', error);
        }
    };



    // context values to export .
    const contextvalues = {
        discount,
        allproducts,
        Adminproducts,
        isLoggedIn,
        cart,
        countryCode,
        shippingInfo,
        fetchUserIP,
        fetchCarousels,
        fnadminproducts,
        fetchUsers,
        fetchOrders,
        confirmDelete,
        handlePaymentSubmit,
        handleShippingSubmit,
        fetchInfo,
        login, signup,
        handleLogout,
        userinfo, myorders,
        addToCart, removeFromCart,
        getTotalCartAmount, getTotalCartItems,
        getStoredCart,applyPromoCode
    };

    return (
        <Context.Provider value={contextvalues}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
