import { models } from "../config/database.js";
import bcrypt from "bcryptjs";
const { User, Order } = models; // Lấy User từ models đã khởi tạo

export const getAllUsersWithPagination = async (req, res) => {
    const { page, limit } = req.query; // Lấy page và limit từ query parameters

    // Chuyển đổi các tham số page và limit thành kiểu số (bắt buộc để phân trang chính xác)
    const offset = (page - 1) * limit; // Tính toán offset cho phân trang

    try {
        // Lấy danh sách người dùng với phân trang
        const users = await User.findAndCountAll({
            limit: parseInt(limit), // Số lượng người dùng trên mỗi trang
            offset: parseInt(offset), // Bắt đầu từ record nào
            order: [["created_at", "DESC"]], // Sắp xếp theo ngày tạo (hoặc bạn có thể thay đổi thứ tự)
        });

        // Trả về kết quả
        res.json({
            totalUsers: users.count, // Tổng số người dùng
            totalPages: Math.ceil(users.count / limit), // Tổng số trang
            currentPage: page, // Trang hiện tại
            users: users.rows, // Danh sách người dùng
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ec: 0,
            message: "Lỗi khi lấy danh sách người dùng.",
        });
    }
};

export const createUser = async (req, res) => {
    const { name, email, phone, address, password, role } = req.body; // Lấy dữ liệu người dùng từ body request

    // Kiểm tra các trường dữ liệu bắt buộc
    if (!name || !email || !phone || !address || !password) {
        return res.status(400).json({
            ec: 0,
            message:
                "Vui lòng cung cấp đầy đủ thông tin (Tên, Email, Số điện thoại, Địa chỉ, Mật khẩu)",
        });
    }

    try {
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                ec: 0,
                message: "Email đã tồn tại, vui lòng chọn email khác",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            role,
        });

        // Trả về thông tin người dùng mới vừa tạo
        return res.status(201).json({
            ec: 1,
            message: "Tạo người dùng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi tạo người dùng:", error);
        return res.status(500).json({
            ec: 0,
            message: "Lỗi hệ thống, không thể tạo người dùng",
        });
    }
};

export const updateUser = async (req, res) => {
    const { userId } = req.params; // ID người dùng cần cập nhật
    const { name, email, phone, address } = req.body; // Dữ liệu cần cập nhật

    try {
        // Tìm người dùng theo ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res
                .status(404)
                .json({ ec: 0, message: "Không tìm thấy người dùng" });
        }

        // Cập nhật thông tin người dùng
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;

        // Lưu thông tin đã cập nhật vào cơ sở dữ liệu
        await user.save();

        return res
            .status(200)
            .json({ ec: 1, message: "Cập nhật người dùng thành công", user });
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        return res.status(500).json({ ec: 0, message: "Lỗi hệ thống" });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Tìm người dùng theo userId
        const user = await User.findByPk(userId);

        if (!user) {
            return res
                .status(404)
                .json({ ec: 0, message: "Không tìm thấy người dùng" });
        }

        // Kiểm tra xem người dùng có đơn hàng nào không
        const orders = await Order.findAll({ where: { user_id: userId } });

        if (orders.length > 0) {
            return res.status(400).json({
                ec: 0,
                message: "Người dùng có đơn hàng, không thể xóa",
            });
        }

        // Nếu không có đơn hàng, tiến hành xóa người dùng
        await user.destroy();

        return res
            .status(200)
            .json({ ec: 1, message: "Xóa người dùng thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        return res.status(500).json({ ec: 0, message: "Lỗi hệ thống" });
    }
};

export const changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    try {
        // Xác thực người dùng
        const user = await User.findByPk(userId); // Lấy thông tin user từ token
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "Người dùng không tồn tại." });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu cũ không chính xác.",
            });
        }

        // Kiểm tra mật khẩu mới và xác nhận
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu xác nhận không khớp.",
            });
        }

        // Cập nhật mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res
            .status(200)
            .json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống, vui lòng thử lại sau.",
        });
    }
};
