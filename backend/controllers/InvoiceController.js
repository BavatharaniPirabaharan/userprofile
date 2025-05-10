import express from "express";
import cors from "cors";
import InvoiceModel from "../models/Invoice.js";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


const router = express.Router();
router.use(cors());

router.post("/addinvoice", async (req, res) => {
    const { vendorName, invoiceNumber, issueDate, dueDate, status, amount, taxAmount } = req.body;

    // Validate required fields
    if (!vendorName || !invoiceNumber || !issueDate || !dueDate || !status || 
        amount === undefined || taxAmount === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
            missingFields: {
                vendorName: !vendorName,
                invoiceNumber: !invoiceNumber,
                issueDate: !issueDate,
                dueDate: !dueDate,
                status: !status,
                amount: amount === undefined,
                taxAmount: taxAmount === undefined
            }
        });
    }

    // Validate numeric fields
    if (isNaN(amount)) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a number"
        });
    }

    if (isNaN(taxAmount)) {
        return res.status(400).json({
            success: false,
            message: "Tax amount must be a number"
        });
    }

    try {
        const totalAmount = parseFloat(amount) + parseFloat(taxAmount);

        const invoice = new InvoiceModel({
            invoiceNumber,
            vendorName,
            issueDate: new Date(issueDate),
            dueDate: new Date(dueDate),
            status,
            amount: parseFloat(amount),
            taxAmount: parseFloat(taxAmount),
            totalAmount
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: "Invoice created successfully!",
            invoice
        });

    } catch (err) {
        console.error("Invoice creation error:", err);
        res.status(500).json({
            success: false,
            message: "Error creating invoice",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

router.get("/getIn/user/:userId", async (req, res) => {
    try {
        const invoices = await InvoiceModel.find({ userId: req.params.userId });
        res.json({
            success: true,
            invoices,
            count: invoices.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get invoices"
        });
    }
});

router.get("/getIn", async (req, res) => {
    try {
        const invoices = await InvoiceModel.find({});
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: "Error fetching invoices", error: err });
    }
});

router.get("/getIn/:id", async (req, res) => {
    try {
        const invoice = await InvoiceModel.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving invoice", error: err });
    }
});

router.delete("/deleteIn/:id", async (req, res) => {
    try {
        const deleteIn = await InvoiceModel.findByIdAndDelete(req.params.id);
        if (!deleteIn) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting invoice", error: err });
    }
});

router.put("/updateinvoice/:id", async (req, res) => {
    const { userId, vendorName, invoiceNumber, issueDate, dueDate, status, amount, taxAmount } = req.body;

    try {
        const totalAmount = amount + taxAmount; // Calculate total amount

        const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
            req.params.id,
            { userId, vendorName, invoiceNumber, issueDate, dueDate, status, amount, taxAmount, totalAmount },
            { new: true }
        );

        if (!updatedInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(updatedInvoice);
    } catch (err) {
        res.status(500).json({ message: "Error updating invoice", error: err });
    }
});





router.get("/download-pdf/:id", async (req, res) => {
    try {
      const { jsPDF } = require('jspdf');
      require('jspdf-autotable');
      
      const invoice = await InvoiceModel.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
  
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text(`INVOICE #${invoice.invoiceNumber}`, 105, 25, { align: 'center' });
  
      // Company Info
      doc.setFontSize(12);
      doc.text('Your Company Name', 15, 40);
      doc.text('123 Business Street, City', 15, 46);
  
      // Invoice Details
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 15, 60);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 15, 66);
      doc.text(`Status: ${invoice.status}`, 15, 72);
  
      // Items Table
      doc.autoTable({
        startY: 80,
        head: [
          [
            { content: 'Description', styles: { fillColor: [41, 128, 185], textColor: 255 } },
            { content: 'Amount', styles: { fillColor: [41, 128, 185], textColor: 255, halign: 'right' } }
          ]
        ],
        body: [
          ['Subtotal', formatCurrency(invoice.amount)],
          ['Tax', formatCurrency(invoice.taxAmount)],
          [
            { content: 'TOTAL', styles: { fontStyle: 'bold' } },
            { content: formatCurrency(invoice.totalAmount), styles: { fontStyle: 'bold', halign: 'right' } }
          ]
        ],
        styles: {
          cellPadding: 5,
          fontSize: 10,
          lineColor: [200, 200, 200],
          lineWidth: 0.3
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40, halign: 'right' }
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
  
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);
      
      // Send the PDF
      const pdfBuffer = doc.output('arraybuffer');
      res.send(Buffer.from(pdfBuffer));
  
    } catch (err) {
      console.error("PDF generation error:", err);
      res.status(500).json({ 
        success: false,
        message: "Error generating PDF",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });
  
  // Helper function
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  }

export default router;
