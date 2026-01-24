const Transaction = require("../models/Transaction");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

// POST /api/transactions - Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { userId, date, amount, type, status, paymentMode } = req.body;

    // Validation
    if (!userId || !amount || !type || !status || !paymentMode) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["userId", "amount", "type", "status", "paymentMode"],
      });
    }

    // Validate enum values
    const validTypes = ["Online", "COD", "Refund"];
    const validStatuses = ["Success", "Pending", "Failed"];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (amount < 0) {
      return res.status(400).json({ error: "Amount must be non-negative" });
    }

    const transaction = new Transaction({
      userId,
      date: date || new Date(),
      amount,
      type,
      status,
      paymentMode,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/transactions - Fetch transactions with filters
exports.getTransactions = async (req, res) => {
  try {
    const { userId, type, dateFrom, dateTo } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Build filter
    const query = { userId };

    if (type) {
      // Validate type
      const validTypes = ["Online", "COD", "Refund"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
      query.type = type;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/transactions/export - Export transactions as PDF or CSV
exports.exportTransactions = async (req, res) => {
  try {
    const { userId, format, type, dateFrom, dateTo } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!format) {
      return res.status(400).json({ error: "format is required (pdf or csv)" });
    }

    // Build filter (same as getTransactions)
    const query = { userId };

    if (type) {
      const validTypes = ["Online", "COD", "Refund"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
      query.type = type;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    if (format === "csv") {
      // Generate CSV
      const fields = [
        { label: "Transaction ID", value: "_id" },
        { label: "Date", value: "date" },
        { label: "Amount", value: "amount" },
        { label: "Type", value: "type" },
        { label: "Status", value: "status" },
        { label: "Payment Mode", value: "paymentMode" },
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(transactions);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.csv",
      );
      return res.send(csv);
    } else if (format === "pdf") {
      // Generate PDF
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.pdf",
      );

      doc.pipe(res);

      // PDF Header
      doc.fontSize(20).text("Transaction History", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Table Header
      doc.font("Helvetica-Bold");
      doc.text("Date", 50, 150);
      doc.text("Type", 150, 150);
      doc.text("Payment Mode", 250, 150);
      doc.text("Status", 380, 150);
      doc.text("Amount", 470, 150);

      doc.moveTo(50, 165).lineTo(550, 165).stroke();
      doc.font("Helvetica");

      // Rows
      let y = 180;
      transactions.forEach((t) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const dateStr = t.date
          ? new Date(t.date).toISOString().split("T")[0]
          : "";
        const amountStr = "₹" + t.amount.toFixed(2);

        doc.text(dateStr, 50, y);
        doc.text(t.type, 150, y);
        doc.text(t.paymentMode, 250, y, { width: 120, ellipsis: true });
        doc.text(t.status, 380, y);
        doc.text(amountStr, 470, y);

        y += 25;
      });

      doc.end();
    } else {
      res.status(400).json({ error: "Invalid format. Use 'pdf' or 'csv'" });
    }
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({ error: error.message });
  }
};
