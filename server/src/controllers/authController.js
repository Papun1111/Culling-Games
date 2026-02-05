// server/src/controllers/authController.js
export const googleLogin = async (req, res) => {
  // logic is handled in middleware, this just responds
  res.status(200).json({
    message: 'Authentication successful',
    user: req.user, // Validated user from DB
  });
};