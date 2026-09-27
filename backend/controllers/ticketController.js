const Ticket = require("../models/Ticket");
const { sendTicketReplyEmail } = require("../utils/sendEmail");

// @route POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { subject, category, message, bookingId } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are both required" });
    }

    const ticket = await Ticket.create({
      user: req.user._id,
      booking: bookingId || undefined,
      subject,
      category: category || "General",
      messages: [{ sender: "user", senderName: req.user.name, text: message }],
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/tickets/my
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/tickets (admin)
const getAllTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const tickets = await Ticket.find(filter)
      .populate("user", "name email phone")
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("user", "name email phone");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (req.user.role !== "admin" && ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This ticket does not belong to you" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/tickets/:id/reply  (user or admin)
const replyTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Please write a message" });

    const ticket = await Ticket.findById(req.params.id).populate("user", "name email");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const isOwner = ticket.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "This ticket does not belong to you" });
    }

    const sender = isAdmin ? "admin" : "user";
    ticket.messages.push({ sender, senderName: req.user.name, text: message });

    if (isAdmin && ticket.status === "open") ticket.status = "in-progress";
    if (isOwner && ["resolved", "closed"].includes(ticket.status)) ticket.status = "open";

    await ticket.save();

    if (isAdmin) {
      sendTicketReplyEmail(ticket.user.email, ticket.subject, message).catch(() => {});
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/tickets/:id/status (admin)
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    ticket.status = status;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, getTicketById, replyTicket, updateTicketStatus };
