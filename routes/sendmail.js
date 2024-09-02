
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();


const user = process.env.EMAIL_USERNAME;
const pass = process.env.EMAIL_PASSWORD;


const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: { user, pass }
});


router.post('/', async (req, res) => {
    const { name, firstName, email, message } = req.body;
    const mailOptions = {
        from: email,
        to: user,
        subject: 'New Contact Message',
        text: `You have a new message from ${name} ${firstName} (${email}): ${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Failed to send email:", error);
        res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
    }
});

module.exports = router;


// const nodemailer = require('nodemailer');

// module.exports = async function handler(req, res) {
//     if (req.method === 'POST') {
//         const { name, email, message } = req.body;

//         // Set up transporter
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USERNAME,  // Ensure you have these in your environment variables
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });

//         const mailOptions = {
//             from: `Your Website Name <${email}>`,  // Optional: Specify your service email here if you want all emails to come from a specific address
//             to: 'faseyfra@gmail.com',  // Your receiving email address
//             subject: 'New Contact Message',
//             text: `You have a new message from ${name} (${email}): ${message}`,
//             html: `<p>You have a new message from <strong>${name}</strong> (${email}):</p><p>${message}</p>`  // Sending HTML email
//         };

//         try {
//             await transporter.sendMail(mailOptions);
//             res.status(200).json({ success: true, message: "Email sent successfully" });
//         } catch (error) {
//             console.error("Failed to send email:", error);
//             res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
//         }
//     } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// };
