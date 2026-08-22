const cloudinary=require("../config/cloudinary");
const uploadImage=(file,folder)=>new Promise((resolve,reject)=>cloudinary.uploader.upload_stream({folder,resource_type:"image",allowed_formats:["jpg","jpeg","png","webp"]},(error,result)=>error?reject(new Error("Cloudinary upload failed")):resolve({url:result.secure_url,publicId:result.public_id})).end(file.buffer));
const deleteImage=async(publicId)=>{if(publicId)await cloudinary.uploader.destroy(publicId,{resource_type:"image"});}; module.exports={uploadImage,deleteImage};
