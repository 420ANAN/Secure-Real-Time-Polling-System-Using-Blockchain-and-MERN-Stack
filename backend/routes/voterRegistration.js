const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const VoterApplication = require('../models/VoterApplication');

/**
 * AI-Powered Voter Verification Agent
 * This agent automatically checks the submitted details and verifies eligibility.
 */
const verifyApplication = async (data) => {
    const errors = [];

    // 1. Age Verification (Must be 18+)
    const dob = new Date(data.dob);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
        errors.push('Applicant must be at least 18 years old.');
    }

    // 2. Aadhaar Format Check
    if (data.aadhaarNumber && !/^\d{12}$/.test(data.aadhaarNumber)) {
        errors.push('Invalid Aadhaar Number format. Must be 12 digits.');
    }

    // 3. Email Format Check
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email address format.');
    }

    // 4. Duplicate Check
    const duplicateQuery = [];
    if (data.aadhaarNumber) duplicateQuery.push({ aadhaarNumber: data.aadhaarNumber });
    if (data.mobileNumber) duplicateQuery.push({ mobileNumber: data.mobileNumber });

    if (duplicateQuery.length > 0) {
        const existing = await VoterApplication.findOne({ $or: duplicateQuery });
        if (existing) {
            errors.push('An application with this Aadhaar or Mobile number already exists.');
        }
    }

    // 5. Citizenship Check
    if (!data.documents?.citizenshipProofType || !data.documents?.citizenshipProofFile) {
        errors.push('Citizenship proof document is required.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const generateEPIC = (state) => {
    const prefix = (state || 'IND').substring(0, 3).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${random}`;
};

// POST /api/register-voter/submit
router.post('/submit', async (req, res) => {
    try {
        const applicationData = req.body;
        
        // Run Agent Validation (only for format/age checks)
        const verification = await verifyApplication(applicationData);

        if (verification.isValid) {
            const referenceNumber = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            
            // DO NOT Auto-Approve. Save as PENDING for Admin review.
            const application = new VoterApplication({ 
                ...applicationData, 
                status: 'PENDING',
                referenceNumber,
                adminRemarks: 'Awaiting manual review by Administrator'
            });

            await application.save();

            res.status(201).json({
                message: `Application submitted successfully! Reference Number: ${referenceNumber}. Please wait for Admin approval.`,
                referenceNumber,
                status: 'PENDING'
            });
        } else {
            // Still reject obvious errors (age, format)
            res.status(400).json({ status: 'REJECTED', errors: verification.errors });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error submitting application' });
    }
});

// GET /api/register-voter/status/:ref
router.get('/status/:ref', async (req, res) => {
    try {
        const application = await VoterApplication.findOne({ referenceNumber: req.params.ref.toUpperCase() });
        if (!application) {
            return res.status(404).json({ message: 'Application not found. Please check your reference number.' });
        }
        res.json(application);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching status' });
    }
});

module.exports = router;
