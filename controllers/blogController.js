const Blog = require('../models/Blog');
const slugify = require('slugify');

/**
 * @desc    Create a new blog
 * @route   POST /api/blogs
 * @access  Private
 */
exports.createBlog = async (req, res) => {
    try {
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin users can create blogs' });
        }

        const { title, category, status, description, articleBody, blogImageUrl } = req.body;

        // Validate category
        const validCategories = ['technology', 'lifestyle', 'general'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category. Must be one of: technology, lifestyle, general' });
        }

        // Validate status
        const validStatuses = ['published', 'draft'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be either published or draft' });
        }

        const slug = slugify(title, { lower: true, strict: true });

        const blog = new Blog({
            userId: req.user._id,
            title,
            slug,
            category,
            status: status || 'draft',
            description,
            articleBody,
            blogImageUrl
        });

        if (blog.status === 'published') blog.publishDate = new Date();

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
        const {
            page = 1,
            limit = 10,
            search = '',
            category,
            status,
            startDate,
            endDate
        } = req.query;

        // Build query object
        let query = {};

        // If user is not admin, only show published blogs
        if (req.user && req.user.role !== 'admin') {
            query.status = 'published';
        }

        // Search on title and slug only
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            const validCategories = ['technology', 'lifestyle', 'general'];
            if (validCategories.includes(category)) {
                query.category = category;
            } else {
                return res.status(400).json({ error: 'Invalid category. Must be one of: technology, lifestyle, general' });
            }
        }

        // Status filter - only allowed for admin users
        if (status) {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Only admin users can filter by status' });
            }
            const validStatuses = ['published', 'draft'];
            if (validStatuses.includes(status)) {
                query.status = status;
            } else {
                return res.status(400).json({ error: 'Invalid status. Must be either published or draft' });
            }
        }

        // Date range filter on publishDate
        if (startDate || endDate) {
            query.publishDate = {};
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({ error: 'Invalid startDate format' });
                }
                query.publishDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    return res.status(400).json({ error: 'Invalid endDate format' });
                }
                query.publishDate.$lte = end;
            }
        }

        const blogs = await Blog.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBlogs: total,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });
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
        const { page = 1, limit = 10, search = '', category, status, startDate, endDate } = req.query;
        const { userId } = req.params;

        // Build query object
        let query = { userId };

        // Search on title and slug only
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            const validCategories = ['technology', 'lifestyle', 'general'];
            if (validCategories.includes(category)) {
                query.category = category;
            } else {
                return res.status(400).json({ error: 'Invalid category. Must be one of: technology, lifestyle, general' });
            }
        }

        // Status filter
        if (status) {
            const validStatuses = ['published', 'draft'];
            if (validStatuses.includes(status)) {
                query.status = status;
            } else {
                return res.status(400).json({ error: 'Invalid status. Must be either published or draft' });
            }
        }

        // Date range filter on publishDate
        if (startDate || endDate) {
            query.publishDate = {};
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({ error: 'Invalid startDate format' });
                }
                query.publishDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    return res.status(400).json({ error: 'Invalid endDate format' });
                }
                query.publishDate.$lte = end;
            }
        }

        const blogs = await Blog.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBlogs: total,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });
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
        const { page = 1, limit = 10, search = '', category, status, startDate, endDate } = req.query;

        // Build query object
        let query = { userId: req.user._id };

        // Search on title and slug only
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            const validCategories = ['technology', 'lifestyle', 'general'];
            if (validCategories.includes(category)) {
                query.category = category;
            } else {
                return res.status(400).json({ error: 'Invalid category. Must be one of: technology, lifestyle, general' });
            }
        }

        // Status filter
        if (status) {
            const validStatuses = ['published', 'draft'];
            if (validStatuses.includes(status)) {
                query.status = status;
            } else {
                return res.status(400).json({ error: 'Invalid status. Must be either published or draft' });
            }
        }

        // Date range filter on publishDate
        if (startDate || endDate) {
            query.publishDate = {};
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({ error: 'Invalid startDate format' });
                }
                query.publishDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    return res.status(400).json({ error: 'Invalid endDate format' });
                }
                query.publishDate.$lte = end;
            }
        }

        const total = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPages = Math.ceil(total / Number(limit));
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            blogs,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalBlogs: total,
                limit: Number(limit),
                hasNextPage,
                hasPrevPage
            }
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
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin users can update blogs' });
        }

        const { title, category, status, description, articleBody, blogImageUrl } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        // Validate category if provided
        if (category) {
            const validCategories = ['technology', 'lifestyle', 'general'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({ error: 'Invalid category. Must be one of: technology, lifestyle, general' });
            }
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['published', 'draft'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Must be either published or draft' });
            }
        }

        blog.title = title || blog.title;
        blog.slug = title ? slugify(title, { lower: true, strict: true }) : blog.slug;
        blog.category = category || blog.category;
        blog.status = status || blog.status;
        blog.description = description || blog.description;
        blog.articleBody = articleBody || blog.articleBody;
        blog.blogImageUrl = blogImageUrl || blog.blogImageUrl;

        if (blog.status === 'published' && !blog.publishDate) {
            blog.publishDate = new Date();
        }

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
        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin users can delete blogs' });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        await Blog.findByIdAndDelete(blog.id);
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
