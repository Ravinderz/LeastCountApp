var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = mongoose.model('user', new Schema({
	firstName : String,
	lastName : String,
	email : {type:String, unique : true},
	password : String,
	phone : {type:Number},
	isActive : {type:Boolean , default:true},
	circles : [{name : String,members : [String] ,isActive : {type:Boolean , default:false}}]
}));

module.exports = User;