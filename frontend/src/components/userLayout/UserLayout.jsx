import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Body from '../bodysection/Body';
import Productcategory from '../../pages/product-category/Productcategory';
import Fullproductdisplay from '../../pages/fullproductdisplay/Fullproductdisplay';
import Cart from '../../pages/cart/Cart';
import Login from '../../pages/login/signup/Login';
import Checkout from '../../pages/checkout/Checkout';
import Payment from '../confirmorder/Payment';
import Ordersuccess from '../ordersuccess/Ordersuccess';
import AboutUs from '../aboutus/AboutUs';
import ContactUs from '../contactus/ContactUs';
import NewsletterSubscribe from '../newsLetter/NewsletterSubscribe';




const UserLayout = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path='/' element={<Body/>} />
                <Route path='/women shoes' element={<Productcategory category="women shoes" />} />
                <Route path='/bags' element={<Productcategory category="bags" />} />
                <Route path='/perfumes' element={<Productcategory category="perfumes" />} />
                <Route path='/wallets' element={<Productcategory category="wallets" />} />
                <Route path='/men shoes' element={<Productcategory category="men shoes" />} />
                <Route path='/belts' element={<Productcategory category="belts" />} />
                <Route path='/accessories' element={<Productcategory category="accessories" />} />
                <Route path='/horse saddle' element={<Productcategory category="horse saddle" />} />
                <Route path='/cosmetics' element={<Productcategory category="cosmetics" />} />
                <Route path='/product/:id' element={<Fullproductdisplay />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/account/*' element={<Login />} />
                <Route path='/cart/checkout' element={<Checkout />} />
                <Route path='/cart/checkout/payment' element={<Payment />} />
                <Route path='/ordersuccess' element={<Ordersuccess />} />
                <Route path='/aboutus' element={<AboutUs />} />
                <Route path='/contactus' element={<ContactUs/>}/>
                <Route path='/newsletter' element={<NewsletterSubscribe/>} />
                
            </Routes>
            <Footer />
        </>
    );
}

export default UserLayout;
