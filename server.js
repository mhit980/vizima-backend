require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const connectDB = require("./config/database");


// Import routes
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");
const bannerRoutes = require("./routes/banners");
const userRoutes = require("./routes/users");
const spamRoutes = require("./routes/spam");
const homeRoutes = require("./routes/home");
const contactRoutes = require("./routes/contact");
const faqRoutes = require("./routes/faq");
const testimonialRoutes = require("./routes/testimonial");
const visitBookingRoutes = require("./routes/visitBooking");
const scheduleVisitRoutes = require("./routes/scheduleVisit");
const cityRoutes = require("./routes/city");
const roomOptionRoutes = require("./routes/roomOptions");

const app = express();

app.set("trust proxy", function (ip) {
    // Trust all proxies in production, none in development
    if (process.env.NODE_ENV === "production") return true;
    return false;
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spam/", spamRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/schedule", scheduleVisitRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/visit-bookings", visitBookingRoutes);
app.use("/api/schedule-visits", scheduleVisitRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/room-options", roomOptionRoutes);


// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Property Rental API is running",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(
        ` API Documentation available at http://localhost:${PORT}/api-docs`
    );
    console.log(`Health check available at http://localhost:${PORT}/health`);
});
