import React, { useState } from 'react';
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

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Get the user role from the token
  const token = sessionStorage.getItem('auth-token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null; // Decode JWT and get the role

  // Sidebar items
  const sidebarItems = [
    { path: "/admin", label: "Dashboard", icon: <LuLayoutDashboard />, roles: ['Admin', 'Owner'] },
    { path: "addproduct", label: "Add New Product", icon: <CiShoppingCart />, roles: ['Admin', 'Owner', 'Editor'] },
    { path: "productlist", label: "Manage Products", icon: <CiBoxList />, roles: ['Admin', 'Owner', 'Editor'] },
    { path: "orders", label: "View Orders", icon: <MdOutlineVerified />, roles: ['Admin', 'Owner', 'Editor'] },
    { path: "users", label: "Manage Users", icon: <LiaUserSolid />, roles: ['Admin', 'Owner'] },
    { path: "carousel", label: "Manage Carousel", icon: <BiCarousel />, roles: ['Admin', 'Owner', 'Editor'] },
    { path: "queries", label: "Manage Queries", icon: <AiOutlineMessage />, roles: ['Admin', 'Owner'] },
    { path: "popup", label: "Popups", icon: <IoMdNotifications />, roles: ['Admin', 'Owner', "Editor"] },
    { path: "promocode", label: "Promo Codes", icon: <RiDiscountPercentLine />, roles: ['Admin', 'Owner'] },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar_toggle" onClick={toggleSidebar}>
        <FiMenu />
      </div>
      {sidebarItems
        .filter(item => item.roles.includes(userRole)) // Filter items based on the user role
        .map((item, index) => (
          <Link to={item.path} className="sidebar_item" key={index} aria-label={item.label}>
            {item.icon}
            <p>{item.label}</p>
          </Link>
        ))}
    </div>
  );
};

export default Sidebar;
