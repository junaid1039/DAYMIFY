import React, { useEffect, useState, useContext, useCallback } from 'react';
import './admindashboard.css';
import { Line } from 'react-chartjs-2';
import { FaBox, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';
import { Context } from '../../context API/Contextapi';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import Adminloader from '../adminloader/Adminloader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const { fetchOrders, fnadminproducts, fetchUsers } = useContext(Context);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
    });
    const [chartData, setChartData] = useState({});
    const [latestOrders, setLatestOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('all'); // Default to all-time

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const productsResult = await fnadminproducts();
            if (productsResult.success) {
                const totalProducts = productsResult.data.products.length;
                await fetchDashboardStats(totalProducts);
                await fetchOrdersChart(); // Fetch order chart data
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDashboardStats = async (totalProducts) => {
        try {
            const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()]); // Fetch users and orders concurrently
            
            const totalSales = calculateSales(orders, selectedPeriod); // Calculate sales based on selected period

            setStats({
                totalProducts,
                totalUsers: users.length,
                totalOrders: orders.length,
                totalSales,
            });
            setLatestOrders(orders.slice(0, 5));
        } catch (err) {
            setError('Failed to load dashboard stats');
        }
    };

    const calculateSales = (orders, period) => {
        const now = new Date();
        let filteredOrders = orders;

        switch (period) {
            case 'today':
                filteredOrders = orders.filter(order => new Date(order.dateOrdered).toDateString() === now.toDateString());
                break;
            case 'week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                filteredOrders = orders.filter(order => new Date(order.dateOrdered) >= startOfWeek);
                break;
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                filteredOrders = orders.filter(order => new Date(order.dateOrdered) >= startOfMonth);
                break;
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                filteredOrders = orders.filter(order => new Date(order.dateOrdered) >= startOfYear);
                break;
            default: // all time
                break;
        }

        return filteredOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    };

    const fetchOrdersChart = async () => {
        const orders = await fetchOrders();
        const data = formatOrderChartData(orders);
        setChartData(data);
    };

    const formatOrderChartData = (orders) => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return { labels: [], datasets: [] };
        }

        const orderCounts = Array(30).fill(0);
        const labels = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        orders.forEach(order => {
            const orderDate = new Date(order.dateOrdered).toISOString().split('T')[0];
            const index = labels.indexOf(orderDate);
            if (index > -1) {
                orderCounts[index]++;
            }
        });

        return {
            labels,
            datasets: [{
                label: 'Orders in Last 30 Days',
                data: orderCounts,
                fill: true,
                backgroundColor: 'rgba(99, 132, 255, 0.3)',
                borderColor: '#6079ff',
            }]
        };
    };

    useEffect(() => {
        fetchDashboardData(); // Initial fetch for dashboard data
    }, [fetchDashboardData]);

    useEffect(() => {
        fetchDashboardStats(stats.totalProducts); // Re-fetch when the selected period changes
    }, [selectedPeriod, stats.totalProducts]); // Re-run on `selectedPeriod` change

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
    };

    if (loading) {
        return <Adminloader />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard">
            
            <div className="dashboard-stats">
                <div className="stats-box" onClick={() => navigate('/admin/productlist')}>
                    <FaBox className="stat-icon" />
                    <div>
                        <p>Total Products</p>
                        <h3>{stats.totalProducts}</h3>
                    </div>
                </div>
                <div className="stats-box" onClick={() => navigate('/admin/users')}>
                    <FaUsers className="stat-icon" />
                    <div>
                        <p>Total Users</p>
                        <h3>{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="stats-box" onClick={() => navigate('/admin/orders')}>
                    <FaShoppingCart className="stat-icon" />
                    <div>
                        <p>Total Orders</p>
                        <h3>{stats.totalOrders}</h3>
                    </div>
                </div>
                <div className="stats-box">
                    <FaDollarSign className="stat-icon" />
                    <div>
                        <p>Total Sales</p>
                        <h3>${stats.totalSales.toFixed(2)}</h3>
                        <select className="sales-dropdown" value={selectedPeriod} onChange={handlePeriodChange}>
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="dashboard-chart">
                <Line data={chartData} />
            </div>

            <div className="dashboard-latest-orders">
                <h3>Latest Orders</h3>
                <ul>
                    {latestOrders.length > 0 ? (
                        latestOrders.map((order) => (
                            <li key={order._id}>
                                Order # {order._id} - ${order.totalPrice} - {new Date(order.dateOrdered).toLocaleDateString()}
                            </li>
                        ))
                    ) : (
                        <li>No latest orders available.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
