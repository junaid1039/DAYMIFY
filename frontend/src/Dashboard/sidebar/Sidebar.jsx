import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './sidebar.css';
import { Link } from 'react-router-dom';
import { CiShoppingCart, CiBoxList } from "react-icons/ci";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineVerified } from "react-icons/md";
import { LiaUserSolid } from "react-icons/lia";
import { FiMenu } from "react-icons/fi"; // Hamburger icon
import { BiCarousel } from "react-icons/bi";
import { IoMdNotifications } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { RiDiscountPercentLine } from "react-icons/ri";
import { FaRegNewspaper } from "react-icons/fa";
import { VscFeedback } from "react-icons/vsc";


const SidebarItem = React.memo(({ item }) => (
  <Link to={item.path} className="sidebar_item" aria-label={item.label}>
    {item.icon}
    <p>{item.label}</p>
  </Link>
));

const Sidebar = () => {
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
  const [isOpen, setIsOpen] = useState(false);
  const [allowComponents, setAllowComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState();
  const userId = sessionStorage.getItem('userId');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const fetchUserComponents = useCallback(async () => {
    if (userId) {
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
    }
  }, [userId, baseurl]);

  useEffect(() => {
    fetchUserComponents();
  }, [fetchUserComponents]);

  // Sidebar items
  const sidebarItems = useMemo(() => [
    { path: "/admin", label: "Dashboard", icon: <LuLayoutDashboard />, key: "AdminDashboard" },
    { path: "addproduct", label: "Add New Product", icon: <CiShoppingCart />, key: "Addproduct" },
    { path: "productlist", label: "Manage Products", icon: <CiBoxList />, key: "Productlist" },
    { path: "orders", label: "View Orders", icon: <MdOutlineVerified />, key: "AdminOrders" },
    { path: "users", label: "Manage Users", icon: <LiaUserSolid />, key: "AdminUsers" },
    { path: "carousel", label: "Manage Carousel", icon: <BiCarousel />, key: "AdminCarousel" },
    { path: "queries", label: "Manage Queries", icon: <AiOutlineMessage />, key: "AdminQueries" },
    { path: "popup", label: "Popups", icon: <IoMdNotifications />, key: "Adminpopup" },
    { path: "promocode", label: "Promo Codes", icon: <RiDiscountPercentLine />, key: "AdminPromoCode" },
    { path: "adminletter", label: "Newsletters", icon: <FaRegNewspaper />, key: "AdminNews" },
    { path: "feedbacks", label: "Feedbacks", icon: <VscFeedback />, key: "feedbacks" },
  ], []);

  // Loading spinner
  if (loading) {
    return <div></div>;
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar_toggle" onClick={toggleSidebar}>
        <FiMenu />
      </div>
      {sidebarItems
        .filter(item => allowComponents.includes('Fullaccess') || allowComponents.includes(item.key)) // Filter based on allowed components
        .map((item, index) => (
          <SidebarItem key={index} item={item} />
        ))}
    </div>
  );
};

export default Sidebar;
