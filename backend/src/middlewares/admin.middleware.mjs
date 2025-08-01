import jwt from 'jsonwebtoken'

const secret = process.env.SECRET_KEY ?? "secret-key";

export async function accessForAdminOnly(request, response, next) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return response.status(401).json({ message: "No authorization header" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return response.status(401).json({ message: "No token provided" });
        }

        const verifyToken = await jwt.verify(token, secret);

        if (verifyToken && verifyToken.role === "admin") {
            request.user = verifyToken;
            return next();
        } else {
            return response.status(403).json({ message: "Forbidden: Admins only" });
        }
    } catch (error) {
        response.status(401).json({
            message: "Unauthorized access",
            error: error.message
        });
    }
}

export default accessForAdminOnly;