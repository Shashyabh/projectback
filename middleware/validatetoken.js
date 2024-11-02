const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
require("dotenv").config();

const ValidateToken = async (req, res, next) => {
	try {
		const bearerHeader = req.headers["authorization"];
		if (typeof bearerHeader == "undefined") {
			return res.json({
				status: false,
				data: null,
				msg: "token required ",
			});
		}
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		const decode = jwt.verify(req.token, process.env.SECRET_KEY);
		const isUser = await User.findOne({ _id: decode.userId });
		if (!isUser) {
			return res.json({
				status: false,
				data: null,
				msg: "User not exists",
			});
		}
		req.userId = decode.userId;
		next();
	} catch (error) {
		return res.json({
			status: false,
			data: null,
			msg: error.message,
		});
	}
};

module.exports = {
	ValidateToken,
};
