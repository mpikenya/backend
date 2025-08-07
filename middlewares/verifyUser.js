const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Read the JWKS URL from environment variables instead of hardcoding it
const CLERK_JWKS_URL = process.env.CLERK_JWKS_URL;

// Add a check to ensure the variable is loaded correctly
if (!CLERK_JWKS_URL) {
  throw new Error("Missing CLERK_JWKS_URL in .env file.");
}

const client = jwksClient({
  jwksUri: CLERK_JWKS_URL
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyToken = (req, res, next) => {
  // ... the rest of your verifyToken function remains the same
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    
    req.user = { id: decoded.sub };
    next();
  });
};

module.exports = { verifyToken };