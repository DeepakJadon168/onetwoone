const express = require("express");
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
} = require("../controllers/ticketController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createTicket);
router.get("/my", protect, getMyTickets);
router.get("/", protect, adminOnly, getAllTickets);
router.get("/:id", protect, getTicketById);
router.post("/:id/reply", protect, replyTicket);
router.put("/:id/status", protect, adminOnly, updateTicketStatus);

module.exports = router;
