const mongoose = require("mongoose");
const Quiz = require("./quiz");
const Questions = require("./question");
const User = require("./user");

const adminSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userType: { type: String, default: "Admin" },
  name: { type: String, required: true },
  googleId: { type:Number },
	email: {
		
	},
	
});

module.exports = mongoose.model("Admin", adminSchema);
