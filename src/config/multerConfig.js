// import multer from "multer";
// import path from "path";

// // Cấu hình nơi lưu trữ hình ảnh
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Đảm bảo rằng hình ảnh được lưu trong thư mục uploads
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         // Lưu hình ảnh với tên duy nhất (đặt tên theo timestamp để tránh trùng lặp)
//         const uniqueSuffix = Date.now() + path.extname(file.originalname);
//         cb(null, file.fieldname + "-" + uniqueSuffix);
//     },
// });

// // Kiểm tra file upload có phải là hình ảnh không
// const fileFilter = (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const extname = fileTypes.test(
//         path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = fileTypes.test(file.mimetype);

//     if (extname && mimetype) {
//         return cb(null, true); // Chấp nhận file
//     } else {
//         cb(new Error("Chỉ chấp nhận hình ảnh (JPEG, JPG, PNG, GIF)"));
//     }
// };

// // Tạo middleware multer
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
// });

// export default upload;
