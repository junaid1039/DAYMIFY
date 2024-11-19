const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.header('auth-token');

    // Check if the token is provided
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied, no token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Attach user data to the request object

        // Check if the user's role is either admin or owner
        const allowedRoles = [process.env.ROLE, 'Owner']; // Use admin from environment variable and explicitly allow owner
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Insufficient privileges.' 
            });
        }

        next(); // User is authorized
    } catch (error) {
        // Provide more context in the error response
        res.status(400).json({ 
            success: false, 
            message: 'Invalid token', 
            error: error.message 
        });
    }
};


const userauth = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied, no token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token', error: error.message });
    }
};

// Export both auth and userauth as an object
module.exports = { auth, userauth };