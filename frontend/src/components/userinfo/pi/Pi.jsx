import React, { useContext, useEffect, useState } from 'react';
import './pi.css';
import { Context } from '../../../context API/Contextapi';

const Pi = () => {
    const { userinfo } = useContext(Context);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const data = await userinfo(); 
            setUserData({
                name: data.name || "N/A",
                email: data.email || "N/A",
                phone: data.phone || "N/A",
                address: data.address || "N/A",
            });
        };

        fetchUserInfo();
    }, [userinfo]);

    return (
        <div className="pi-card">
            <h2 className="pi-title">User Information</h2>
            <div className="pi-content">
                <div className="pi-field">
                    <span className="pi-label">Name:</span>
                    <span className="pi-value">{userData ? userData.name : "Loading..."}</span>
                </div>
                <div className="pi-field">
                    <span className="pi-label">Email:</span>
                    <span className="pi-value">{userData ? userData.email : "Loading..."}</span>
                </div>
            </div>
        </div>
    );
};

export default Pi;
