import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId }],
    category: { type: String },
    description: { type: String },
    type: { type: String, enum: ['group', 'personal'], required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date, default: Date.now }
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;

