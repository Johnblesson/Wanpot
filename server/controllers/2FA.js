import speakeasy from 'speakeasy'; // 2FA library 
import QRCode from 'qrcode'; // QR code generator
import User from '../models/auth.js'; // User model
import jwt from 'jsonwebtoken'; // JWT library
import dotenv from 'dotenv'; // Environment variable library
dotenv.config();

// Generate a QR code and set up 2FA for the user
export const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: 'agrotech-sl' });

    // Save the base32 secret to the user's record in the database
    const user = await User.findById(req.user._id);
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate a QR code for the user to scan
    QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      // Render the setup page with QR code
      res.render('setup-2fa', { qrCode: dataUrl, secret: secret.base32 });
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set up 2FA', error });
  }
};

// Verify the user's 2FA token
export const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    // Retrieve the user from session
    const sessionUser = req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ msg: 'Unauthorized: No user session found' });
    }

    const user = await User.findById(sessionUser._id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA is not enabled for this user' });
    }

    // Verify the token using the stored secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      token,
      encoding: 'base32',
      window: 2,
    });

    if (verified) {
      // Generate a new JWT token
      const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      req.session.user = user;

      // Redirect based on user role
      if (user.role === 'admin') {
        return res.redirect(`/admin-home?token=${newToken}`);
      } else {
        return res.redirect(`/home?token=${newToken}`);
      }
    } else {
      console.error('2FA Verification failed:', {
        token,
        secret: user.twoFactorSecret,
        verified,
      });
      return res.redirect('/invalid-2FA-code');
    }
  } catch (err) {
    console.error('Error during 2FA verification:', err);
    res.status(500).json({ msg: 'Server error during 2FA verification' });
  }
};

// Handle enabling/disabling of 2FA
export const toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { twoFactorAuth } = req.body;

    if (twoFactorAuth === 'enable' && !user.twoFactorEnabled) {
      // Enable 2FA
      const secret = speakeasy.generateSecret({ name: 'agrotech-sl' });
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = true;
      await user.save();
      res.redirect('/setup-2fa');
    } else if (twoFactorAuth === 'disable' && user.twoFactorEnabled) {
      // Disable 2FA
      user.twoFactorSecret = null;
      user.twoFactorEnabled = false;
      await user.save();
      res.redirect('/settings');
    } else {
      res.redirect('/settings');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling 2FA', error });
  }
};
