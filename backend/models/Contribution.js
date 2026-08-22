const mongoose = require("mongoose");
module.exports=mongoose.model("Contribution",new mongoose.Schema({contributorName:{type:String,required:true,trim:true,maxlength:100},amount:{type:Number,required:true,min:0},date:{type:Date,default:Date.now},message:{type:String,trim:true,maxlength:500},receiptUrl:String,receiptPublicId:String,isVisible:{type:Boolean,default:true}},{timestamps:true}));
