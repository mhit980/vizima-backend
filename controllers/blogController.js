const Blog = require('../models/Blog');
const slugify = require('slugify');

/**
 * @desc    Create a new blog
 * @route   POST /api/blogs
 * @access  Private
 */
exports.createBlog = async (req, res) => {
    try {
        const { title, category, status, seo } = req.body;

        const slug = slugify(title, { lower: true, strict: true });

        const blog = new Blog({
            userId: req.user._id,
            title,
            slug,
            category,
            status,
            seo
        });

        if (status === 'published') blog.publishDate = new Date();

        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * @desc    Get all blogs with pagination + search
 * @route   GET /api/blogs
 * @access  Public
 */
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { 'seo.title': { $regex: search, $options: 'i' } },
                { 'seo.meta': { $regex: search, $options: 'i' } }
            ]
        };

        const blogs = await Blog.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(query);

        res.json({ blogs, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Get blog by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Get blogs by user ID with search + pagination
 * @route   GET /api/blogs/user/:userId
 * @access  Public
 */
exports.getBlogsByUserId = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const { userId } = req.params;

        const query = {
            userId,
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { 'seo.title': { $regex: search, $options: 'i' } },
                { 'seo.meta': { $regex: search, $options: 'i' } }
            ]
        };

        const blogs = await Blog.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(query);

        res.json({ blogs, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Get blogs of current user with pagination and optional search
 * @route   GET /api/blogs/me
 * @access  Private
 */
exports.currentUserBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {
            userId: req.user._id,
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        };

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            blogs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/**
 * @desc    Update blog by ID
 * @route   PUT /api/blogs/:id
 * @access  Private
 */
exports.updateBlog = async (req, res) => {
    try {
        const { title, category, status, seo } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        if (blog.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        blog.title = title || blog.title;
        blog.slug = title ? slugify(title, { lower: true, strict: true }) : blog.slug;
        blog.category = category || blog.category;
        blog.status = status || blog.status;
        blog.seo = seo || blog.seo;

        if (status === 'published') blog.publishDate = blog.publishDate || new Date();

        await blog.save();
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @desc    Delete blog by ID
 * @route   DELETE /api/blogs/:id
 * @access  Private
 */
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        if (blog.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Blog.findByIdAndDelete(blog.id);
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
