const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const PDFDocument = require("pdfkit");
const moment = require("moment");

// Download route to generate PDF
router.get('/download', async (req, res) => {
  console.log("Download request received!");  // Confirm the route is hit
  try {
    // Fetch the most recent subscription data from the database
    const subscription = await Subscription.findOne().sort({ createdAt: -1 });  // Ensure the latest subscription is fetched

    if (!subscription) {
      console.log("No subscription found");
      return res.status(404).json({ message: "No subscription found" });
    }

    // Calculate the amount: first 2 months are free, after that, $20.00 per month
    const subscriptionStartDate = moment(subscription.createdAt);
    const currentDate = moment();
    let amount = 0;

    // If subscription is older than 2 months, calculate the amount based on months passed
    const monthsSinceSubscription = currentDate.diff(subscriptionStartDate, 'months');
    if (monthsSinceSubscription >= 2) {
      amount = 20.00;  // $20.00 after 2 months
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const filename = `subscription-history-${moment().format('YYYY-MM-DD')}.pdf`;
    
    // Set response headers for downloading the PDF
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(12).text('Subscription History', { align: 'center' });
    doc.moveDown();
    
    // Add subscription details in the PDF
    doc.text(`Date: ${moment().format('YYYY-MM-DD')}`);
    doc.text(`Amount: $${amount.toFixed(2)}`);  // Display the calculated amount
    doc.text(`Card Number: **** **** **** ${subscription.cardNumber.slice(-4)}`);  // Show only the last 4 digits of the card number
    doc.text(`Card Type: ${subscription.cardType}`);

    // Finalize and send the PDF to the client
    doc.end();
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

// Route to handle subscription creation
router.post("/", async (req, res) => {
  try {
    const { cardNumber, expiryDate, pinCode, cardType } = req.body;

    const newSubscription = new Subscription({
      cardNumber,
      expiryDate,
      pinCode,
      cardType,
    });

    await newSubscription.save();
    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
