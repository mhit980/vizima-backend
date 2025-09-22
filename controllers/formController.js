const Form = require('../models/form');

/**
 * @desc    Create a new form submission
 * @route   POST /api/forms
 * @access  Public
 */
exports.createForm = async (req, res) => {
    try {
        const { name, phone, location, pgType } = req.body;
        const form = new Form({ name, phone, location, pgType });
        await form.save();
        res.status(201).json(form);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @desc    Get all form submissions
 * @route   GET /api/forms
 * @access  Public
 */
exports.getAllForms = async (req, res) => {
    try {
        const forms = await Form.find().sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Get a single form submission by ID
 * @route   GET /api/forms/:id
 * @access  Public
 */
exports.getFormById = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Update a form submission by ID
 * @route   PUT /api/forms/:id
 * @access  Public
 */
exports.updateForm = async (req, res) => {
    try {
        const { name, phone, location, pgType } = req.body;
        const form = await Form.findByIdAndUpdate(req.params.id, { name, phone, location, pgType }, { new: true, runValidators: true });
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @desc    Delete a form submission by ID
 * @route   DELETE /api/forms/:id
 * @access  Public
 */
exports.deleteForm = async (req, res) => {
    try {
        const form = await Form.findByIdAndDelete(req.params.id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};