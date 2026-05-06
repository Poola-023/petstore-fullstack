/*
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App; // THIS LINE IS REQUIRED*//*
*/
/*

*/
/*

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/signup'; // Import your new page
import VendorSignup from './pages/VendorSignup';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import PetDetails from './pages/PetDetails';

function App() {
  const [user, setUser] = useState(null); // This holds the logged-in user details
  const [cart, setCart] = useState([]);


  // Function to add pets to cart
  const addToCart = (pet) => {
      setCart((prevCart) => [...prevCart, pet]);
    };
  return (
    <Router>
      <Routes>
        {*//*
*/
/*

*//*

*/
/* Pass setUser to Login so it can "log the user in" *//*
*/
/*
*//*

*/
/*
}
        <Route path="/login" element={<Login setUser={setUser} />} />

        {*//*
*/
/*

*//*

*/
/* Pass the user state to Dashboard to show the name or Login button *//*
*/
/*
*//*

*/
/*
}
        <Route path="/" element={<Dashboard user={user} setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
        <Route path="/pet-details/:id" element={<PetDetails user={user} />} />

        <Route
                  path="/cart"
                  element={<Cart cart={cart} setCart={setCart} />}
                />
      </Routes>
    </Router>
  );
}

export default App;*//*
*/
/*



*//*

*/
/*
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/signup';
import VendorSignup from './pages/VendorSignup';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import PetDetails from './pages/PetDetails';
// 1. ADD THIS IMPORT
import Cart from './pages/Cart';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import VendorOrders from './pages/VendorOrders';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const addToCart = (pet) => {
      setCart((prevCart) => [...prevCart, pet]);
  };
  // Inside App.js

*//*

*/
/*useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
          setUser(JSON.parse(savedUser)); // Restores Poola's session
      }
  }, []);*//*
*/
/*
*//*

*/
/*

  useEffect(() => {
      if (user) {
          // Fetch saved cart from DB instead of localStorage
          fetch(`http://${window.location.hostname}:8080/api/cart/user/${user.id}`)
              .then(res => res.json())
              .then(data => setCart(data));
      }
  }, [user]);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        {*//*
*/
/*

*//*

*/
/* 2. PASS CART TO DASHBOARD FOR THE NAV COUNTER *//*
*/
/*
*//*

*/
/*
}
        <Route path="/" element={<Dashboard user={user} setUser={setUser} cart={cart} />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard user={user} />} // Ensure user={user} is here
        />
        *//*
*/
/*

*//*

*/
/* src/App.js *//*
*/
/*
*//*

*/
/*

        <Route
            path="/vendor-dashboard"
            element={<VendorDashboard user={user} setUser={setUser} />}
        />
        <Route path="/vendor-dashboard" element={<VendorDashboard user={user} setUser={setUser} />} // Add setUser={setUser} here
        />
        {*//*
*/
/*

*//*

*/
/* 3. FIXED: ADDED addToCart={addToCart} PROP *//*
*/
/*
*//*

*/
/*
}
        <Route path="/pet-details/:id" element={<PetDetails user={user} addToCart={addToCart} />} />

        <Route path="/pet-details/:id" element={<PetDetails user={user} cart={cart} addToCart={addToCart} />} // Pass 'cart' here
        />
        *//*
*/
/*

*//*

*/
/* Inside App.js Routes *//*
*/
/*
*//*

*/
/*

        <Route path="/order-history" element={<OrderHistory user={user} />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route
            path="/vendor-orders"
            element={<VendorOrders user={user} />}
        />
        <Route
            path="/cart"
            element={<Cart cart={cart} setCart={setCart} user={user} />} // ADD user={user} HERE
        />
        <Route
            path="/checkout"
            element={<Checkout cart={cart} setCart={setCart} user={user} />}
        />
      </Routes>
    </Router>
  );
}

export default App;*//*
*/
/*

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import PetDetails from './pages/PetDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';

// Vendor Page Imports
import VendorSignup from './pages/VendorSignup';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import VendorOrders from './pages/VendorOrders';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Restore user session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync Cart with Backend when user logs in
  useEffect(() => {
    if (user && user.userId) { // Using userId to match your Java POJO
      fetch(`http://${window.location.hostname}:8080/api/cart/user/${user.userId}`)
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch((err) => console.error("Cart sync error:", err));
    }
  }, [user]);

  // Global Function to add pets to cart
  const addToCart = (pet) => {
    setCart((prevCart) => [...prevCart, pet]);
  };

  return (
    <Router>
      <Routes>
        {*/
/* User Authentication & Profile *//*
}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        {*/
/* Main Storefront *//*
}
        <Route path="/" element={<Dashboard user={user} setUser={setUser} cart={cart} />} />
        <Route path="/pet-details/:id" element={<PetDetails user={user} cart={cart} addToCart={addToCart} />} />

        {*/
/* Shopping & Orders *//*
}
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} user={user} />} />
        <Route path="/order-history" element={<OrderHistory user={user} />} />
        <Route path="/track-order" element={<TrackOrder />} />

        {*/
/* Vendor Section *//*
}
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard user={user} setUser={setUser} />} />
        <Route path="/vendor-orders" element={<VendorOrders user={user} />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />

        {*/
/* Catch-all Redirect *//*
}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;*/


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import PetDetails from './pages/PetDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';

// Vendor Page Imports
import VendorSignup from './pages/VendorSignup';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import VendorOrders from './pages/VendorOrders';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import AllPets from './pages/AllPets';
import StorePage from './pages/StorePage';
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Restore user session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync Cart with Backend when user logs in
  useEffect(() => {
    if (user && user.userId) { // Using userId to match your Java POJO
      fetch(`http://${window.location.hostname}:8080/api/cart/user/${user.userId}`)
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch((err) => console.error("Cart sync error:", err));
    }
  }, [user]);

  // Global Function to add pets to cart
  const addToCart = (pet) => {
    setCart((prevCart) => [...prevCart, pet]);
  };


  return (
    <Router>
      <Routes>
        {/* User Authentication & Profile */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main Storefront */}
        <Route path="/" element={<Dashboard user={user} setUser={setUser} cart={cart} />} />
        <Route path="/pet-details/:id" element={<PetDetails user={user} cart={cart} addToCart={addToCart} />} />

        {/* Shopping & Orders */}
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} user={user} />} />
        <Route path="/order-history" element={<OrderHistory user={user} />} />
        <Route path="/track-order" element={<TrackOrder />} />

        {/* Vendor Section */}
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard user={user} setUser={setUser} />} />
        <Route path="/vendor-orders" element={<VendorOrders user={user} />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
        <Route path="/all-pets" element={<AllPets cart={cart} setCart={setCart} />} />
        <Route path="/store/:vendorId" element={<StorePage />} />
        <Route path="/store/:vendorId" element={<StorePage cart={cart} setCart={setCart} />} />
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;