import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Group from "./models/Group.js";
import Expense from "./models/Expenses.js";
import Settlement from "./models/Settlement.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});
    console.log("Cleared existing data.");

    // 1. Create 4 Users
    const users = await User.insertMany([
      { username: "Alice", email: "alice@example.com", password: "password123" },
      { username: "Bob", email: "bob@example.com", password: "password123" },
      { username: "Charlie", email: "charlie@example.com", password: "password123" },
      { username: "David", email: "david@example.com", password: "password123" },
    ]);
    console.log("Inserted 4 users.");

    const [u1, u2, u3, u4] = users;

    // 2. Create 2 Groups (do not include all 4 users in all the groups)
    const groups = await Group.insertMany([
      {
        name: "Apartment 404",
        members: [u1._id, u2._id, u3._id],
        createdBy: u1._id,
      },
      {
        name: "Weekend Trip",
        members: [u1._id, u3._id, u4._id],
        createdBy: u3._id,
      },
    ]);
    console.log("Inserted 2 groups.");

    const [g1, g2] = groups;

    // 3. Create 4 Group Expenses per Group (do not include all group members in all the expenses)
    const groupExpenses = [
      // Apartment 404 Expenses
      {
        description: "Rent",
        amount: 1500,
        paidBy: u1._id,
        participants: [u1._id, u2._id, u3._id],
        category: "Housing",
        type: "group",
        groupId: g1._id,
      },
      {
        description: "Electricity Bill",
        amount: 150,
        paidBy: u2._id,
        participants: [u1._id, u2._id, u3._id],
        category: "Utilities",
        type: "group",
        groupId: g1._id,
      },
      {
        description: "Groceries",
        amount: 200,
        paidBy: u3._id,
        participants: [u1._id, u2._id, u3._id],
        category: "Food",
        type: "group",
        groupId: g1._id,
      },
      {
        description: "Internet",
        amount: 60,
        paidBy: u1._id,
        participants: [u1._id, u2._id], // Only Alice and Bob use high-speed internet
        category: "Utilities",
        type: "group",
        groupId: g1._id,
      },
      // Weekend Trip Expenses
      {
        description: "Gas",
        amount: 80,
        paidBy: u4._id,
        participants: [u1._id, u3._id, u4._id],
        category: "Transport",
        type: "group",
        groupId: g2._id,
      },
      {
        description: "Hotel Stay",
        amount: 450,
        paidBy: u1._id,
        participants: [u1._id, u3._id, u4._id],
        category: "Travel",
        type: "group",
        groupId: g2._id,
      },
      {
        description: "Dinner at Beach",
        amount: 120,
        paidBy: u3._id,
        participants: [u1._id, u3._id, u4._id],
        category: "Food",
        type: "group",
        groupId: g2._id,
      },
      {
        description: "Museum Entry",
        amount: 90,
        paidBy: u4._id,
        participants: [u1._id, u4._id], // Charlie skipped the museum
        category: "Entertainment",
        type: "group",
        groupId: g2._id,
      },
    ];
    await Expense.insertMany(groupExpenses);
    console.log("Inserted 8 group expenses (4 per group).");

    // 4. Create 5 Personal Expenses per User
    const personalExpenses = [];
    users.forEach((user) => {
      for (let i = 1; i <= 5; i++) {
        personalExpenses.push({
          description: `Personal Expense ${i} for ${user.username}`,
          amount: Math.floor(Math.random() * 50) + 10,
          paidBy: user._id,
          participants: [user._id],
          category: "Personal",
          type: "personal",
          date: new Date(),
        });
      }
    });
    await Expense.insertMany(personalExpenses);
    console.log("Inserted 20 personal expenses (5 per user).");

    // 5. Create Sample Settlements
    const settlements = [
      {
        fromUser: u2._id, // Bob pays Alice
        toUser: u1._id,
        amount: 50,
        groupId: g1._id,
      },
      {
        fromUser: u3._id, // Charlie pays Alice
        toUser: u1._id,
        amount: 30,
        groupId: g1._id,
      },
      {
        fromUser: u1._id, // Alice pays David
        toUser: u4._id,
        amount: 25,
        groupId: g2._id,
      },
    ];
    await Settlement.insertMany(settlements);
    console.log("Inserted sample settlements.");

    console.log("Data seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
