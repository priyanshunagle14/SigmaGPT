import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        req.userId = null; // guest user
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.secret);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        req.userId = null; // invalid token = guest
        next();
    }
};

export default verifyToken;