const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateTokens } = require('../jwt.js');
const Users = require('../models/users');



// // Route for user sign-up
// router.post('/signUp', async (req, res) => {
//     try {
//         const data = new Users(req.body);
//         const savedUserData = await data.save();
//         console.log('Data saved successfully');

//         const payload = { id: savedUserData._id };
//         console.log(JSON.stringify(payload));

//         const token = generateTokens({ username: savedUserData.username });
//         console.log("Token is generated:", token);

//         res.status(201).json({ user: savedUserData, token: token });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'There is a network issue', message: err.message });
//     }
// });
router.post('/signUp', async (req, res) => {
    try {
        const data = new Users(req.body);
        const savedUserData = await data.save();
        console.log('Data saved successfully');

        const payload = { id: savedUserData._id }; // Include user ID in the payload
        const token = generateTokens(payload);
        console.log("Token is generated:", token);

        res.status(201).json({ user: savedUserData, token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'There is a network issue', message: err.message });
    }
});
router.post('/logIn', async (req, res) => {
    try {
        const { aadharCardnumber, password } = req.body;
        const user = await Users.findOne({ aadharCardnumber });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const payload = { id: user._id }; // Include user ID in the payload
        const token = generateTokens(payload);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'There is a network issue' });
    }
});



// Route for user login
// router.post('/logIn', async (req, res) => {
//     try {
//         const { aadharCardnumber, password } = req.body;
//         const user = await Users.findOne({ aadharCardnumber: aadharCardnumber });

//         if (!user || !(await user.comparePassword(password))) {
//             return res.status(401).json({ message: 'Invalid username or password' });
//         }

//         const payload = { id: user._id };
//         const token = generateTokens(payload);
//         res.status(200).json({ token: token });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'There is a network issue' });
//     }
// });

// Route to get user profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extracted user ID from the JWT
        const user = await Users.findById(userId);

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'There is a network issue' });
    }
});

// Route to update user password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await Users.findById(userId);
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        user.password = newPassword;
        await user.save();
        console.log('Password updated successfully');
        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There is a network issue' });
    }
});

module.exports = router;
