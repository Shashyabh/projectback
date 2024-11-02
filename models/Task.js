const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
	{
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		title: {
			type: String,
			required: true,
		},
		priority: {
			type: String,
			required: true,
			enum: ["high", "moderate", "low"],
		},
		status: {
			type: String,
			required: true,
			enum: ["backlog", "todo", "progress", "done"],
		},
		checkLists: [
			{
				type: Array,
			},
		],
		dueDate: {
			type: Date,
		},
		assignTo: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timeStamps: true }
);

const Task = new mongoose.model("Task", TaskSchema);

module.exports = {
	Task,
};
