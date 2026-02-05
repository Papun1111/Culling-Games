// server/src/middleware/auth.js
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/db.js';

// Client ID must match the one in your Google Cloud Console
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyToken = async (req, res, next) => {
  try {
    // 1. Get token from header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No Authorization header found' });
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer"

    // 2. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    // 3. Find User in DB
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    const now = new Date();

    if (!user) {
      // --- NEW USER: Auto-Register ---
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name: payload.name,
          image: payload.picture,
          points: 0,
          cursedEnergy: 100,
          lastLoginAt: now, // Explicitly set to now
        },
      });
    } else {
      // --- EXISTING USER: Check 19-Day Culling Rule ---
      const lastLogin = new Date(user.lastLoginAt);
      const diffMs = now - lastLogin;
      const nineteenDaysMs = 19 * 24 * 60 * 60 * 1000; // 19 Days in Milliseconds

      if (diffMs >= nineteenDaysMs) {
        // ⚠️ PENALTY: Reset Points for Inactivity
        console.log(`⚖️ JUDGMENT: User ${user.email} was inactive for 19 days. Points reset.`);
        
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            points: 0,            // Wipe points
            cursedEnergy: 100,    // Reset energy to standard
            lastLoginAt: now,     // Reset timer
          }
        });
      } else {
        // ✅ SAFE: Just update their login timestamp
        // We do this in the background (no await) if performance is critical, 
        // but awaiting ensures data consistency.
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: now }
        });
        
        // Update local instance to match DB state
        user.lastLoginAt = now;
      }
    }

    // 4. Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};