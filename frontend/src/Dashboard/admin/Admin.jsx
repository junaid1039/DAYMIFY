import React, { useEffect, useState } from 'react';
import './admin.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar.jsx';
import Addproduct from '../addproduct/Addproduct.jsx';
import Productlist from '../productlist/Productlist.jsx';
import Editproduct from '../editproduct/Editproduct.jsx';
import AdminNavbar from '../adminnavbar/AdminNavbar.jsx';
import AdminOrders from '../allorders/AdminOrders.jsx';
import AdminUsers from '../adminusers/Adminusers.jsx';
import AdminDashboard from '../adminDashboard/AdminDashboard.jsx';
import AdminCarousel from '../admincarousel/AdminCarousel.jsx';
import AdminQueries from '../adminquories/AdminQueries.jsx';
import Adminpopup from '../popup/Adminpopup.jsx';
import AdminPromoCode from '../AdminpromoCode/AdminPromoCode.jsx';
import AdminNews from '../adminNews/AdminNews.jsx';
import Loader from '../../components/loader/Loader.jsx';
import AdminFeedback from '../adminFeedback/AdminFeedback.jsx';

const Admin = () => {
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  const token = sessionStorage.getItem('auth-token');
  const [allowComponents, setAllowComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      const fetchUserComponents = async () => {
        try {
          const response = await fetch(`${baseurl}/userdetails/${userId}`);
          const userData = await response.json();
          
  
          if (userData?.user?.role === 'Owner') {
            // Full access for Owner role
            setAllowComponents(['Fullaccess']);
          } else if (Array.isArray(userData?.user?.allowComponents)) {
            // Use allowComponents if it exists and is an array
            setAllowComponents(userData.user.allowComponents);
          } else {
            // Default to an empty array if allowComponents is undefined or invalid
            console.error('Invalid allowComponents:', userData?.user?.allowComponents);
            setAllowComponents([]);
          }
  
          setUserRole(userData?.user?.role || 'Guest'); // Default role
        } catch (error) {
          console.error('Error fetching user components:', error);
          setAllowComponents([]); // Ensure safe fallback
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserComponents();
    }
  }, [userId, baseurl]);
  

  // Redirect if not logged in
  if (!token) {
    return <Navigate to="/account" replace />;
  }

  // Loading spinner
  if (loading) {
    return <div><Loader/></div>;
  }

  // Dynamically render routes
  const renderRoutes = () => {

    if (allowComponents.includes('Fullaccess')) {
      return (
        <>
          <Route path="/" element={<AdminDashboard />} key="admin-dashboard" />
          <Route path="addproduct" element={<Addproduct />} key="addproduct" />
          <Route path="productlist" element={<Productlist />} key="productlist" />
          <Route path="productlist/editproduct/:id" element={<Editproduct />} key="editproduct" />
          <Route path="orders" element={<AdminOrders />} key="admin-orders" />
          <Route path="users" element={<AdminUsers />} key="admin-users" />
          <Route path="carousel" element={<AdminCarousel />} key="admin-carousel" />
          <Route path="queries" element={<AdminQueries />} key="admin-queries" />
          <Route path="popup" element={<Adminpopup />} key="admin-popup" />
          <Route path="promocode" element={<AdminPromoCode />} key="admin-promocode" />
          <Route path="adminletter" element={<AdminNews />} key="admin-news" />
          <Route path="feedbacks" element={<AdminFeedback/>} key="feedbacks" />
        </>
      );
    }

    const routes = [];
    if (allowComponents.includes('AdminDashboard')) {
      routes.push(<Route path="/" element={<AdminDashboard />} key="admin-dashboard" />);
    }
    if (allowComponents.includes('Addproduct')) {
      routes.push(<Route path="addproduct" element={<Addproduct />} key="addproduct" />);
    }
    if (allowComponents.includes('Productlist')) {
      routes.push(<Route path="productlist" element={<Productlist />} key="productlist" />);
    }
    if (allowComponents.includes('Editproduct')) {
      routes.push(<Route path="productlist/editproduct/:id" element={<Editproduct />} key="editproduct" />);
    }
    if (allowComponents.includes('AdminOrders')) {
      routes.push(<Route path="orders" element={<AdminOrders />} key="admin-orders" />);
    }
    if (allowComponents.includes('AdminUsers')) {
      routes.push(<Route path="users" element={<AdminUsers />} key="admin-users" />);
    }
    if (allowComponents.includes('AdminCarousel')) {
      routes.push(<Route path="carousel" element={<AdminCarousel />} key="admin-carousel" />);
    }
    if (allowComponents.includes('AdminQueries')) {
      routes.push(<Route path="queries" element={<AdminQueries />} key="admin-queries" />);
    }
    if (allowComponents.includes('Adminpopup')) {
      routes.push(<Route path="popup" element={<Adminpopup />} key="admin-popup" />);
    }
    if (allowComponents.includes('AdminPromoCode')) {
      routes.push(<Route path="promocode" element={<AdminPromoCode />} key="admin-promocode" />);
    }
    if (allowComponents.includes('AdminNews')) {
      routes.push(<Route path="adminletter" element={<AdminNews />} key="admin-news" />);
    }
    if (allowComponents.includes('Feedbacks')) {
      routes.push(<Route path="feedbacks" element={<AdminFeedback/>} key="feedbacks" />)
    }

    return routes;
  };

  return (
    <div className="d-m">
      <div className="d-n">
        <AdminNavbar />
      </div>
      <div className="sm">
        <Sidebar />
        <Routes>{renderRoutes()}</Routes>
      </div>
    </div>
  );
};

export default Admin;
