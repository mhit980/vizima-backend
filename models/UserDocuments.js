const mongoose = require('mongoose');

const { Schema } = mongoose;

const DOCUMENT_TYPES = ['id_proof', 'address_proof', 'income_proof'];

const DOCUMENT_SUBTYPES = {
    id_proof: ['passport', 'driving_license', 'national_id'],
    address_proof: ['utility_bill', 'bank_statement'],
    income_proof: ['salary_slip', 'bank_statement']
};

const STATUS_TYPES = ['pending', 'approved', 'rejected'];

const UserDocumentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: DOCUMENT_TYPES,
            required: true
        },
        subType: {
            type: String,
            required: true,
            validate: {
                validator: function (value) {
                    return DOCUMENT_SUBTYPES[this.type]?.includes(value);
                },
                message: props => `${props.value} is not a valid subtype for ${props.instance.type}`
            }
        },
        documentUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: STATUS_TYPES,
            default: 'pending'
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('UserDocument', UserDocumentSchema);
