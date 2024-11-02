const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors());

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("MongoDB Connected");
	} catch (err) {
		console.error(err.message);
		// process.exit(1);
	}
};

connectDB();

// add routes
const userRoutes = require("./routes/userRoute");
app.use("/user", userRoutes);

const taskRoutes = require("./routes/taskRoute");
app.use("/task", taskRoutes);

app.listen(5000, () => {
	console.log("server runing on 5000");
});
