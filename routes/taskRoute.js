const express = require("express");
const { ValidateToken } = require("../middleware/validatetoken");
const { Task } = require("../models/Task");
const moment = require("moment");
const { User } = require("../models/User");

const taskRoutes = express.Router();

taskRoutes.post("/createTask", ValidateToken, async (req, res) => {
	try {
		const { title, checkLists, priority, status, assignTo, dueDate } = req.body.data;
		//console.log(title, checkLists, priority, status, assignTo);
		if (
			!title ||
			checkLists.length == 0 ||
			!["backlog", "todo", "progress", "done"].includes(status) ||
			!["high", "moderate", "low"].includes(priority)
		) {
			return res.json({
				status: false,
				data: null,
				msg: "Provide Correct information for create task",
			});
		}
		// console.log(assignTo);
		const user1 = await User.findOne({ email: assignTo });
		// console.log(user1);
		await Task.create({
			creator: req.userId,
			title,
			checkLists: checkLists,
			priority,
			status,
			assignTo: user1,
			dueDate,
		});
		return res.json({
			status: true,
			data: null,
			msg: "Task created succesfully",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			message: error.message,
		});
	}
});

taskRoutes.post("/editTask", ValidateToken, async (req, res) => {
	try {
		const { taskId, title, checkLists, priority, status, assignTo, dueDate } = req.body;
		if (
			!taskId ||
			!title ||
			checkLists.length == 0 ||
			!["backlog", "todo", "progress", "done"].includes(status) ||
			!["high", "moderate", "low"].includes(priority)
		) {
			return res.json({
				status: false,
				data: null,
				msg: "Provide Correct information for create task",
			});
		}
		const isTask = await Task.findOne({ _id: taskId, creator: req.userId });
		if (!isTask) {
			return res.json({
				status: false,
				data: null,
				msg: "Task not exists",
			});
		}
		await Task.updateOne(
			{ _id: taskId },
			{ title, checkLists, priority, status, assignTo, dueDate }
		);
		return res.json({
			status: true,
			data: null,
			msg: "Task updated succesfully",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			message: error.message,
		});
	}
});

taskRoutes.post("/assignTask", ValidateToken, async (req, res) => {
	try {
		const { taskId, assignTo } = req.body;
		if (!taskId || assignTo.length == 0) {
			return res.json({
				status: false,
				data: null,
				msg: "Provide employee for assign ",
			});
		}
		const isTask = await Task.findOne({ _id: taskId, creator: req.userId });
		if (!isTask) {
			return res.json({
				status: false,
				data: null,
				msg: "Task not exists",
			});
		}
		await Task.updateOne({ _id: taskId }, { assignTo });
		return res.json({
			status: true,
			data: null,
			msg: "Task assign to given employee",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			message: error.message,
		});
	}
});

taskRoutes.get("/getAllTaskByStatus/:type", async (req, res) => {
	try {
		const { type } = req.params;

		// Validate the status type
		const validStatuses = ["backlog", "todo", "progress", "done"];
		if (!validStatuses.includes(type)) {
			return res.status(400).json({
				status: false,
				data: null,
				message: "Invalid task status type.",
			});
		}

		// Query the database for tasks with the specified status
		const tasks = await Task.find({ status: type });

		return res.json({
			status: true,
			data: tasks,
			message: "Tasks retrieved successfully.",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			message: error.message,
		});
	}
});

taskRoutes.get("/getTasks", ValidateToken, async (req, res) => {
	try {
		const { type } = req.query;
		// type can be today , week , month
		let date = new Date();
		let filterDate = new Date();
		if (type == "month") {
			filterDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Month is 0-indexed
			filterDate.setHours(23, 59, 59, 0);
		} else if (type == "today") {
			filterDate.setHours(23, 59, 59, 0);
		} else {
			const day = date.getDay(); // Get the current day of the week (0 is Sunday, 6 is Saturday)
			const daysUntilSunday = 6 - day;
			filterDate.setDate(date.getDate() + daysUntilSunday);
			filterDate.setHours(23, 59, 59, 0);
		}

		//  specfic users task ,
		//  filter task by this day , this onth , this week  ,
		const tasks = await Task.find({
			$or: [{ dueDate: { $lt: filterDate } }, { dueDate: null }],
		}).populate("assignTo");
		return res.json({
			status: true,
			data: tasks.map((item) => {
				return {
					taskId: item?._id,
					dueDate: item?.dueDate ? moment(item?.dueDate).format("MMM DD") : "",
					checkLists: item?.checkLists ?? [],
					priority: item?.priority,
					assignTo: item?.assignTo?.map((item2) => {
						return {
							userId: item2?._id,
							email: item2?.email,
							name: item?.name,
						};
					}),
					status: item?.status,
				};
			}),
			msg: "task fetched",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			message: error.message,
		});
	}
});

module.exports = taskRoutes;
