import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { models } from "../config/database.js";

const { User } = models; // Lấy User từ models đã khởi tạo

export const getHomepage = async (req, res) => {
    return res.render("sample.ejs");
};

export const register = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tạo người dùng mới
        const user = await User.create({
            email,
            name,
            phone,
            role,
            password: hashedPassword,
        });
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET
        );
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            // Nếu có lỗi liên quan đến validation của Sequelize
            return res.status(400).json({ message: error.message });
        }
        // Lỗi chung
        res.status(500).json({ message: "Đã xảy ra lỗi server" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(password);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Email không tồn tại!");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu không đúng");
        }
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET
        );
        res.json({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Google client ID

export const google = async (req, res) => {
    try {
        const { tokenId } = req.body; // Nhận tokenId từ client
        if (!tokenId) {
            return res.status(400).json({ message: "Không có token ID" });
        }

        // Xác thực token với Google
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID, // Đảm bảo token thuộc ứng dụng của bạn
        });

        // Lấy thông tin người dùng từ token
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.findOne({ where: { google_id: googleId } });

        if (!user) {
            // Nếu người dùng chưa tồn tại, tạo mới
            user = await User.create({
                google_id: googleId,
                google_name: name,
                google_email: email,
                email,
                name,
            });
        }

        // Tạo JWT token cho người dùng
        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token có thời hạn 1 ngày
        );

        // Trả về thông tin người dùng và token
        res.json({
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};
