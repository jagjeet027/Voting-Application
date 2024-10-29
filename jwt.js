const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: 'Token not found' });
    }

    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Decoded token:", decoded); // Debug: Verify the decoded token
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(500).json({ message: 'Error verifying token' });
    }
};

// const generateTokens = (userData) => {
//     const accessToken =  jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '12h' });
//     return accessToken
// };

const generateTokens = (userData) => {
    const payload = { id: userData.id || userData._id }; // Ensure ID is included
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
    return accessToken;
};


module.exports = { jwtAuthMiddleware, generateTokens };
