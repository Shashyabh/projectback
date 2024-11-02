const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { ValidateToken } = require("../middleware/validatetoken");
const userRoutes = express.Router();
const mongoose = require("mongoose");

userRoutes.post("/register", async (req, res) => {
	try {
		// console.log(req);
		const { name, email, password, confirmPassword } = req.body;
		if (!name || !email || !confirmPassword || !password) {
			return res.json({
				status: false,
				data: null,
				msg: "Required field name email password",
			});
		}
		if (password != confirmPassword) {
			return res.json({
				status: false,
				data: null,
				msg: "Passwords are not same",
			});
		}
		const isUser = await User.findOne({ email: email });
		if (isUser) {
			return res.json({
				status: false,
				data: null,
				msg: "User already exists",
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({
			name,
			email,
			password: hashedPassword,
			mentor: [],
		});
		const newUser = await user.save();

		const token = jwt.sign({ userId: newUser?._id }, process.env.SECRET_KEY, {
			expiresIn: "24h",
		});
		return res.json({
			status: true,
			data: { token, name, email },
			msg: "Sucessfully register ",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});
userRoutes.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.json({
				status: false,
				data: null,
				msg: "Email & Password Required",
			});
		}
		const isUser = await User.findOne({ email: email });
		if (!isUser) {
			return res.json({
				status: false,
				data: null,
				msg: "User not exists",
			});
		}
		let isMatch = await bcrypt.compare(password, isUser.password);
		if (isMatch) {
			const token = jwt.sign({ userId: isUser?._id }, process.env.SECRET_KEY, {
				expiresIn: "24h",
			});

			return res.json({
				status: true,
				data: { token, email: isUser.email, name: isUser.name },
				msg: "Login Successfully",
			});
		} else {
			return res.json({
				status: false,
				data: null,
				msg: "In Correct Password ",
			});
		}
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});

userRoutes.post("/updateProfile", ValidateToken, async (req, res) => {
	try {
		const { name, email, oldPassword, newPassword } = req.body;
		if (!name || !email || !oldPassword || !newPassword) {
			return res.json({
				status: false,
				data: null,
				msg: "Required field name email password",
			});
		}
		if (oldPassword == newPassword) {
			return res.json({
				status: false,
				data: null,
				msg: "Current and New Passwrod is same",
			});
		}
		const isUser = await User.findOne({ _id: { $ne: req.userId }, email: email });
		if (isUser) {
			return res.json({
				status: false,
				data: null,
				msg: "User already exists with email. Try with different email",
			});
		}
		let user = await User.findOne({ _id: req.userId });

		let isMatch = await bcrypt.compare(oldPassword, user.password);
		if (isMatch) {
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			await User.updateOne({ _id: user?._id }, { name, email, passwrod: hashedPassword });
			return res.json({
				status: true,
				data: { name, email },
				msg: "Profile Updated",
			});
		} else {
			return res.json({
				status: false,
				data: null,
				msg: "In Correct Old Password ",
			});
		}
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});

userRoutes.get("/getUsers", ValidateToken, async (req, res) => {
	try {
		const users = await User.find({ _id: { $ne: req.userId } });
		return res.json({
			status: true,
			data: users?.map((item) => {
				return {
					userId: item?._id,
					name: item?.name,
					email: item?.email,
				};
			}),
			msg: "All User fetched",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});
userRoutes.post("/addMember", ValidateToken, async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ _id: req.userId });
		if (!user) {
			return res.json({
				status: false,
				data: null,
				msg: "User not found",
			});
		}

		let existingMember = user.members || [];
		const newMember = await User.findOne({ email });
		//console.log(newMember);
		if (!newMember || !newMember._id) {
			return res.json({
				status: false,
				data: null,
				msg: "New member not found or userId is missing",
			});
		}

		const userIds = newMember._id;
		let newMembers = existingMember.concat(userIds).map((id) => id.toString());
		newMembers = [...new Set(newMembers)];

		const newUser = await User.findOneAndUpdate(
			{ _id: user?._id },
			{ members: newMembers },
			{ new: true, lean: true }
		).populate("members");

		return res.json({
			status: true,
			data: newUser?.members?.map((item) => {
				return {
					userId: item?._id,
					name: item?.name,
					email: item?.email,
				};
			}),
			msg: "Member added successfully",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});

userRoutes.get("/getMembers", ValidateToken, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.userId }).populate("members", "_id name email");
		if (!user) {
			return res.json({
				status: false,
				data: null,
				msg: "User not found",
			});
		}
		return res.json({
			status: true,
			data: user?.members?.map((item) => {
				return {
					userId: item?._id,
					name: item?.name,
					email: item?.email,
				};
			}),
			msg: "Member fetch successfully",
		});
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
});

module.exports = userRoutes;
