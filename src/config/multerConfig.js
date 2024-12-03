import multer from "multer";
import path from "path";

// Cấu hình nơi lưu trữ hình ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Lưu vào thư mục uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

// Kiểm tra tệp tải lên có phải là hình ảnh hay không
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận hình ảnh (JPEG, JPG, PNG, GIF, WEBP)"));
    }
};

// Middleware xử lý tải nhiều hình ảnh
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file 5MB
}).array("images", 5); // "images" là tên field, 5 là số lượng hình ảnh tối đa

export default upload;
