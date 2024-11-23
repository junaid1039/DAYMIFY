const mongoose = require('mongoose');
const Users = require('../models/usermodel');
const jwt = require('jsonwebtoken');

function newId() {
    const prefix = 'usr';
    const randomNumber = Math.floor(Math.random() * 100000);
    return `${prefix}${randomNumber.toString().padStart(5, '0')}`;
}

// Sign up a new user
const signup = async (req, res) => {
    try {
        const existingUser = await Users.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success: false, err: 'User Already Exists' });
        }

        // Initialize cart object
        const cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const { name, email, password, allowComponents } = req.body;

        // Default avatar if not provided
        const avatar = {
            public_id: 'some public id',
            url: 'some url'
        };

        const user = await Users.create({
            userId: newId(),
            name,
            email,
            password, // No hashing, as per your request
            avatar,
            role: 'user',
            allowComponents: allowComponents || [],  // Default to empty array if not provided
        });

        // Generate JWT without expiration
        const userId = user._id;
        const token = jwt.sign({ id: userId }, process.env.SECRET_KEY); // Removed expiresIn

        res.json({ success: true, message: "User added", token });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', err });
    }
};

// Login a user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide both email and password' });
        }

        const user = await Users.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare plain-text passwords directly
        if (password !== user.password) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const userId = user._id;
        const token = jwt.sign({ id: userId, role: user.role }, process.env.SECRET_KEY); // Removed expiresIn

        res.json({ success: true, token, userId });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', err });
    }
};

// Get all users -- Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        
        if (!users.length) {
            return res.status(400).json({ success: false, message: "Users not found" });
        }

        res.status(200).json({ success: true, users });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Update user details
const updateUserDetails = async (req, res) => {
    try {
        const { name, email, role, allowComponents, avatar } = req.body;

        const newUserData = {
            name,
            email,
            role,
            allowComponents: allowComponents || [],  // Default to empty array if not provided
            avatar: avatar || {},  // Default to empty object if not provided
        };

        const user = await Users.findByIdAndUpdate(req.params.id, newUserData, { new: true, runValidators: true, useFindAndModify: false });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User updated successfully", user });

    } catch (err) {
        res.status(400).json({ success: false, message: "Failed to update user", error: err.message });
    }
};

// Get single user details
const getSingleUser = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
};

// Delete user --- Admin
const deleteUser = async (req, res) => {
    try {
        const user = await Users.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete user", error });
    }
};

module.exports = { signup, login, getAllUsers, updateUserDetails, deleteUser, getSingleUser };
