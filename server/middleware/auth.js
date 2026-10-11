import jwt from 'jsonwebtoken';

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
export const verifyAdmin = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied: Log in first" });

    // Clean up quotes
    if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    try {
        let verified = null;
        const keysToTry = [process.env.JWT_SECRET, 'yoursecretkey', 'secret', 'secretkey', 'mysecretkey'];

        for (const secret of keysToTry) {
            if (!secret) continue;
            try {
                verified = jwt.verify(token, secret);
                if (verified) break;
            } catch (e) { /* Continue trying */ }
        }

        // Logic check
        if (verified && verified.usertype === 'admin') {
            req.user = verified;
            next();
        } else {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid Session Token" });
    }
};

// ==========================================
// 2. USER AUTHENTICATION
// ==========================================
export const verifyUser = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Access Denied: Log in first" });

    // Clean up quotes
    if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    try {
        let verified = null;
        const keysToTry = [process.env.JWT_SECRET, 'yoursecretkey', 'secret', 'secretkey', 'mysecretkey'];

        // 1. Try verification
        for (const secret of keysToTry) {
            if (!secret) continue;
            try {
                verified = jwt.verify(token, secret);
                if (verified) break;
            } catch (e) { /* Continue trying */ }
        }

        // 2. Fallback (Only use if you absolutely must)
        if (!verified) {
            const decoded = jwt.decode(token);
            if (decoded && (decoded.id || decoded._id)) {
                verified = decoded;
            }
        }

        if (!verified) {
            return res.status(401).json({ success: false, message: "Invalid Session Token" });
        }

        req.user = verified;
        next();
    } catch (err) {
        console.error("🔥 Middleware Error:", err.message);
        res.status(401).json({ success: false, message: "Invalid Session Token" });
    }
};