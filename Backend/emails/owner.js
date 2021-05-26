const mongoose = require("mongoose");
const Quiz = require("./quiz");
const Questions = require("./question");
const Admin = require("./admin");
const User = require("./user");

const ownerSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String },


module.exports = mongoose.model("Owner", ownerSchema);
