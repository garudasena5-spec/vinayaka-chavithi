const multer=require("multer"); const allowed=new Set(["image/jpeg","image/png","image/webp"]);
module.exports=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>allowed.has(file.mimetype)?cb(null,true):cb(new Error("Only JPG, PNG, and WebP images are allowed"))});
