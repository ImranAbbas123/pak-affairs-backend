const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dxwwmkzmc',
  api_key: '664348941667663',
  api_secret: 'Nd2ChkrqhqEkXbOraMMuSM92YQc'
});

module.exports = cloudinary;
