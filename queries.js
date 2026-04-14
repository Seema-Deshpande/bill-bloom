import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Group from "./models/Group.js";
import Expense from "./models/Expenses.js";

dotenv.config();

async function query1() {
  const result = await Expense.aggregate([
    { $match: { type: "group" } },
    { $group: { _id: "$groupId", total: { $sum: "$amount" } } }
  ]);
  console.log("Total spent per group:", result);
}

async function query2() {
  const result = await Expense.aggregate([
    { $match: { type: "group" } },
    { $group: { _id: { g: "$groupId", u: "$paidBy" }, total: { $sum: "$amount" } } }
  ]);
  console.log("Total paid by each user in groups:", result);
}

async function query3() {
  const expenses = await Expense.find({ type: "group" }).populate("participants", "username");
  expenses.forEach(e => console.log(`${e.description}:`, e.participants.map(p => p.username)));
}

async function query4() {
  const counts = await Expense.aggregate([
    { $match: { type: "group" } },
    { $unwind: "$participants" },
    { $group: { _id: { g: "$groupId", u: "$participants" }, count: { $sum: 1 } } },
    { $sort: { count: 1 } }
  ]);
  console.log("Participation counts:", counts);
}

async function query5() {
  const users = await User.find();
  for (let u of users) {
    const count = await Group.countDocuments({ members: u._id });
    console.log(`${u.username} is in ${count} groups`);
  }
}

async function query6() {
  const duration = await Expense.aggregate([
    { $match: { type: "group" } },
    { $group: { _id: "$groupId", start: { $min: "$date" }, end: { $max: "$date" } } }
  ]);
  duration.forEach(d => {
    const days = Math.ceil((d.end - d.start) / (1000 * 3600 * 24)) + 1;
    console.log(`Group ${d._id} duration: ${days} days`);
  });
}

async function query7() {
  const result = await Expense.aggregate([
    { $match: { type: "personal" } },
    { $sort: { amount: -1 } },
    { $group: { _id: "$paidBy", top3: { $push: "$amount" } } },
    { $project: { top3: { $slice: ["$top3", 3] } } }
  ]);
  console.log("Top 3 personal expenses per user:", result);
}

async function query8() {
  const expenses = await Expense.find({
    type: "personal",
    date: { $gte: new Date("2024-03-01"), $lte: new Date("2024-03-31") }
  });
  console.log("Personal expenses in March:", expenses.length);
}

async function query9() {
  const result = await Expense.aggregate([
    { $match: { type: "personal" } },
    { $group: { _id: "$paidBy", total: { $sum: "$amount" } } }
  ]);
  console.log("Total personal expense per user:", result);
}

async function query10() {
  const result = await Expense.aggregate([
    { $match: { type: "personal" } },
    { $group: { _id: { u: "$paidBy", c: "$category" }, total: { $sum: "$amount" } } }
  ]);
  console.log("Personal expense by category:", result);
}


async function runQueries() {
  printHeader(1, "What is the total amount spent in a group?");
  await query1();
  printHeader(2, "What is the total amount paid by each user in a group?");
  await query2();
  printHeader(3, "Who were the participants of a given expense in a given group?");
  await query3();
  printHeader(4, "Find the usernames who participated in the maximum and minimum no of expenses in a group?");
  await query4();
  printHeader(5, "In how many groups, a given user is a member?");
  await query5();
  printHeader(6, "Based on the expenses created in a group, what is the duration of the trip?");
  await query6();
  printHeader(7, "What are the top 3 highest personal expenses for every user?");
  await query7();
  printHeader(8, "What personal expenses were created within a specific daterange for a given user?");
  await query8();
  printHeader(9, "What is the total personal expense for a user?");
  await query9();
  printHeader(10, "What is the total personal expense based on category for a user?");
  await query10();
}

const printHeader = (num, title) => {
  console.log("\n" + "─".repeat(60));
  console.log(`Q${num}. ${title}`);
  console.log("─".repeat(60));
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully to database");
    await runQueries();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

main();
