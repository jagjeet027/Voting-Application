const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobileNo: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardnumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    IsVoted: {
        type: Boolean,
        default: false
    }
});

// Pre-save hook to hash the password before saving it
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (err) {
        return next(err);
    }
});

// Method to compare the candidate password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
};

const Users = mongoose.model('Users', userSchema, 'user');
module.exports = Users;
