const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Check for mongo error
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404;
        message = "Mongo: Resource not found";
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'prod' ? null : err.stack
    });
};

module.exports = { notFound, errorHandler };