import React, { useEffect, useState } from 'react';
import Categorys from '../categorys/Categorys';
import Subcategory from '../sub-category/Subcategory';
import Carousel from '../carousel/Carousel';
import Cpopup from '../popup/Cpopup';

const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

const Body = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null); 

  useEffect(() => {
    const fetchActivePopups = async () => {
      try {
        // Fetch request to your backend API endpoint
        const response = await fetch(`${baseurl}/active`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        const activePopups = result.data;

        // Check if there are active popups
        if (activePopups && activePopups.length > 0) {
          const currentPopup = activePopups[0];

          // Check display frequency
          const handlePopupDisplay = (popup) => {
            switch (popup.displayFrequency) {
              case 'once_per_session':
                if (!sessionStorage.getItem('popupShown')) {
                  setPopupData(currentPopup);
                  setShowPopup(true);
                  sessionStorage.setItem('popupShown', 'true');
                }
                break;
              
              case 'once_per_day':
                const lastPopupShown = localStorage.getItem('lastPopupShown');
                const today = new Date().toDateString();
                
                if (!lastPopupShown || lastPopupShown !== today) {
                  setPopupData(currentPopup);
                  setShowPopup(true);
                  localStorage.setItem('lastPopupShown', today);
                }
                break;
              
              case 'always':
                setPopupData(currentPopup);
                setShowPopup(true);
                break;
              
              default:
                setPopupData(currentPopup);
                setShowPopup(true);
            }
          };

          // Call the display handler
          handlePopupDisplay(currentPopup);
        }
      } catch (error) {
        console.error('Error fetching active popups:', error);
      }
    };

    // Delay popup appearance slightly
    const popupTimer = setTimeout(() => {
      fetchActivePopups();
    }, 2000); // 2 seconds delay

    // Cleanup function
    return () => {
      clearTimeout(popupTimer);
    };
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Carousel />
      <Categorys />
      <Subcategory />

      {/* Popup Rendering with more robust checking */}
      {showPopup && popupData && (
        <Cpopup
          data={popupData}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default Body;
