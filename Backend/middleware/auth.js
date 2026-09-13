import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        req.userId = null; // guest user
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || process.env.secret;
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        req.userId = null; // invalid token = guest
        next();
    }
};

export default verifyToken;