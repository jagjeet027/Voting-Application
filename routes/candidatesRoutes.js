const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateTokens } = require('../jwt.js');
const candidate = require('../models/candidates');
const Users = require('../models/users.js');
const candidates = require('../models/candidates');

const checkAdminRole = async (userId) => {
    try {
        const user = await Users.findById(userId);
        if (!user) {
            console.error('User not found with ID:', userId);
            return false;
        }
        console.log('User role:', user.role); // Debug: Check the user's role
        return user.role === 'admin';
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false;
    }
};

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        console.log('Requesting user ID:', req.user.id); // Debug: Check the user ID
        const isAdmin = await checkAdminRole(req.user.id);
        console.log('Is Admin:', isAdmin); // Debug: Check if user is admin
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const data = new candidate(req.body);
        const savedCandidatesData = await data.save();
        console.log('Candidate data saved successfully');

        res.status(201).json({ candidate: savedCandidatesData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'There is a network issue', message: err.message });
    }
});


// Route to update a candidate
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID; // extract the id from the URL parameter 
        const updateCandidateData = req.body; // update the candidate data
        const updatedData = await candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
            new: true, // return the updated document
            runValidators: true, // run mongoose validation
        });

        if (!updatedData) {
            return res.status(404).json({ message: 'Candidate not found' });
        } else {
            console.log('Candidate data updated');
            res.status(200).json(updatedData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There is a network issue' });
    }
});

// Route to delete a candidate
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID; // extract the id from the URL parameter 
        const deletedData = await candidate.findByIdAndDelete(candidateId);

        if (!deletedData) {
            return res.status(404).json({ message: 'Candidate not found' });
        } else {
            console.log('Candidate data deleted');
            res.status(200).json({ message: 'Candidate deleted successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There is a network issue' });
    }
});

router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    const candidateId = req.params.candidateId;
    const userId = req.user.id; // Assuming req.user.id is correctly set by the middleware

    try {
        // Fetch candidate by ID
        const candidate = await candidates.findById(candidateId);
        if (!candidate) {
            return res.status(403).json({ message: 'Candidate not found' });
        }

        // Fetch user by ID
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.IsVoted) {
            return res.status(403).json({ message: 'User already voted' });
        }
        if (user.role === 'admin') {
            return res.status(402).json({ message: 'Admin is not allowed to vote' });
        }

        // Update the candidate document to record the vote
        candidate.vote.push({ user: userId });
        candidate.totalVotes++; // Assuming this is the correct field for counting votes

        await candidate.save();

        // Update the user document
        user.IsVoted = true;
        await user.save();

        res.status(200).json({ message: 'Vote recorded successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'There is a network issue' });
    }
});

router.get('/vote/count', async (req,res)=>{
   try{
    const candidate= await candidates.find().sort({voteCount:'desc'});
    const voteRecord= candidate.map((data)=>{
        return{
           party:data.party,
           count:data.voteCount
        }

    })
    res.status(200).json(voteRecord);

   }catch(err){
    console.error(error);
    res.status(500).json({ error: 'There is a network issue' });
   }

})


module.exports = router;
