const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    pgType: {
        type: String,
        required: [true, 'PG type is required'],
        enum: {
            values: ['male', 'female', 'unisex', 'trans'],
            message: 'PG type must be one of: male, female, unisex, or trans'
        },
        lowercase: true
    }
},
{
    timestamps: true
});

const Form = mongoose.model('Form', formSchema);
module.exports = Form;