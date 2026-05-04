const mongoose = require('mongoose');

/**
 * VoterApplication Schema
 * Captures comprehensive details for citizen voter registration on the decentralized platform.
 */
const VoterApplicationSchema = new mongoose.Schema({
    // 1. Basic Personal Details
    fullName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date, required: true },
    placeOfBirth: { type: String },

    // 2. Family Details
    relativeName: { type: String },
    relationshipType: { type: String, enum: ['Father', 'Mother', 'Husband', 'Guardian'] },

    // 3. Address Details
    currentAddress: {
        houseNo: String,
        street: String,
        locality: String,
        town: String,
        district: String,
        state: String,
        pinCode: String
    },
    permanentAddress: {
        isSameAsCurrent: { type: Boolean, default: true },
        fullAddress: String
    },

    // 4. Contact Details
    mobileNumber: { type: String, required: true },
    email: { type: String },

    // 5. Identification Details
    aadhaarNumber: { type: String },
    otherIdType: { type: String, enum: ['Passport', 'PAN', 'Driving License', 'Ration Card', 'None'] },
    otherIdNumber: { type: String },

    // 6 & 7 & 8. Document Proofs (Paths/URLs for storage references)
    documents: {
        ageProofType: { type: String, enum: ['Birth Certificate', '10th Marksheet', 'Passport', 'Aadhaar'] },
        ageProofFile: String, 
        addressProofType: { type: String, enum: ['Aadhaar Card', 'Electricity Bill', 'Rent Agreement', 'Bank Passbook'] },
        addressProofFile: String,
        photograph: String
    },

    // 9. Previous Voter Details (For shifting cases)
    previousVoter: {
        epicNumber: String,
        constituency: String
    },

    // 10. Declaration & Legal Standing
    declaration: {
        isIndianCitizen: { type: Boolean, default: false },
        notRegisteredElsewhere: { type: Boolean, default: false },
        place: String,
        date: { type: Date, default: Date.now },
        signatureHash: String // Placeholder for digital signature verify
    },

    // 11. Special Categories
    specialCategories: {
        isPwD: { type: Boolean, default: false },
        isNRI: { type: Boolean, default: false },
        isServiceVoter: { type: Boolean, default: false }
    },

    // Application Lifecycle
    status: { 
        type: String, 
        enum: ['PENDING', 'APPROVED', 'REJECTED'], 
        default: 'PENDING' 
    },
    walletAddress: { type: String }, // Links the application to a blockchain wallet identity
    adminRemarks: { type: String },
    verifiedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('VoterApplication', VoterApplicationSchema);
