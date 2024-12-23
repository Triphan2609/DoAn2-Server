import { models } from "../config/database.js";
import axios from "axios";
import moment from "moment";
import CryptoJS from "crypto-js";
import { INTEGER } from "sequelize";

const { Order, OrderDetail, Product, User } = models;

export const getAllOrdersWithPagination = async (req, res) => {
    const { page, limit } = req.query; // Lấy page và limit từ query parameters

    // Chuyển đổi các tham số page và limit thành kiểu số (bắt buộc để phân trang chính xác)
    const offset = (page - 1) * limit; // Tính toán offset cho phân trang

    try {
        // Lấy danh sách đơn hàng với phân trang
        const orders = await Order.findAndCountAll({
            limit: parseInt(limit), // Số lượng đơn hàng trên mỗi trang
            offset: parseInt(offset), // Bắt đầu từ record nào
            order: [["created_at", "DESC"]], // Sắp xếp theo ngày tạo (hoặc bạn có thể thay đổi thứ tự)
        });

        // Trả về kết quả
        res.json({
            totalOrders: orders.count, // Tổng số đơn hàng
            totalPages: Math.ceil(orders.count / limit), // Tổng số trang
            currentPage: page, // Trang hiện tại
            orders: orders.rows, // Danh sách đơn hàng
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ec: 0,
            message: "Lỗi khi lấy danh sách đơn hàng.",
        });
    }
};

export const checkoutCOD = async (req, res) => {
    const {
        userId,
        cartItems,
        totalPrice,
        payment_method,
        customer_name,
        email,
        phone,
        address,
        description,
    } = req.body; // Dữ liệu từ client: userId và danh sách sản phẩm trong giỏ hàng

    if (!cartItems || cartItems.length === 0) {
        return res
            .status(400)
            .json({ message: "Thông tin đơn hàng không hợp lệ" });
    }

    // Tạo đơn hàng trong bảng 'orders'
    const newOrder = await Order.create({
        user_id: userId || 2,
        total_price: totalPrice,
        status: "Chờ duyệt",
        customer_name,
        email,
        phone,
        address,
        description,
        payment_method,
    });

    // Bước 3: Tạo các chi tiết đơn hàng trong bảng 'order_details'
    for (let item of cartItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
            await OrderDetail.create({
                order_id: newOrder.order_id,
                product_id: item.product_id,
                unit_quantity: item.quantity,
                unit_price: product.price,
            });
        }
    }

    // Bước 4: Trả về thông tin đơn hàng và thanh toán
    res.status(200).json({
        message: "Đơn hàng đã được tạo thành công",
        orderId: newOrder.order_id,
        totalPrice,
    });
};

const getStatusPayment = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res
            .status(400)
            .json({ message: "Thông tin đơn hàng không hợp lệ" });
    }

    const order = await OrderModel.findByPk(orderId);
    if (order) {
        return res.json({
            status: order.status,
            totalPrice: order.total_price,
        });
    } else {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
};

const config = {
    app_id: "2554",
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: "	trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

export const checkoutZaloPay = async (req, res) => {
    const {
        userId,
        cartItems,
        totalPrice,
        payment_method,
        customer_name,
        email,
        phone,
        address,
        description,
    } = req.body;
    console.log(
        userId,
        cartItems,
        totalPrice,
        payment_method,
        customer_name,
        email,
        phone,
        address,
        description
    );

    if (!userId || !cartItems || cartItems.length === 0) {
        return res
            .status(400)
            .json({ message: "Thông tin đơn hàng không hợp lệ" });
    }

    // Tạo đơn hàng trong bảng 'orders'
    const newOrder = await Order.create({
        user_id: userId || "KH-" + phone,
        total_price: totalPrice,
        status: "pending",
        payment_method,
        customer_name,
        email,
        phone,
        address,
        description,
    });

    // Tạo các chi tiết đơn hàng trong bảng 'order_details'
    for (let item of cartItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
            await OrderDetail.create({
                order_id: newOrder.order_id,
                product_id: item.product_id,
                unit_quantity: item.unit_quantity,
                unit_price: product.price,
            });
        }
    }

    // APP INFO

    const embed_data = {
        redirecturl: "http://localhost:3000/",
    };
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: userId || "KH-" + totalPrice,
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(cartItems),
        embed_data: JSON.stringify(embed_data),
        amount: totalPrice,
        description: `PetShop - Payment for the order #${transID}`,
        bank_code: "zalopayapp",
        callback_url: "http://localhost:3000/api/v1/order/zalopay/callback",
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
        config.app_id +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    try {
        // Gửi yêu cầu tạo thanh toán ZaloPay
        const response = await axios.post(config.endpoint, null, {
            params: order,
        });
        // Trả về URL để người dùng chuyển hướng đến ZaloPay
        res.status(200).json({
            message: "Đơn hàng đã được tạo thành công",
            zpt_url: response.data, // Trả về URL thanh toán ZaloPay
        });
    } catch (error) {
        console.error("Error creating payment order with ZaloPay:", error);
        res.status(500).json({
            message: "Có lỗi xảy ra khi tạo đơn hàng thanh toán.",
        });
    }
};

export const getStatusPaymentZaloPay = async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
        return res
            .status(400)
            .json({ message: "Thông tin đơn hàng không hợp lệ" });
    }

    const order = await Order.findByPk(orderId);
    if (order) {
        return res.json({
            status: order.status,
            totalPrice: order.total_price,
        });
    } else {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
};

export const handlePaymentNotification = async (req, res) => {
    const { order_id, result_code, mac } = req.body;
    const order = await Order.findByPk(order_id);

    if (order) {
        // Kiểm tra kết quả thanh toán
        if (result_code === 1) {
            // Thanh toán thành công
            await order.update({ status: "completed" });
            res.json({ message: "Thanh toán thành công" });
        } else {
            // Thanh toán thất bại
            await order.update({ status: "canceled" });
            res.json({ message: "Thanh toán thất bại" });
        }
    } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
};

export const callBackSuccess = async (req, res) => {
    let result = {};
    console.log(req.body);

    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
        console.log("mac =", mac);

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== mac) {
            // callback không hợp lệ
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            let dataJson = JSON.parse(dataStr, config.key2);
            console.log(
                "update order's status = success where app_trans_id =",
                dataJson["app_trans_id"]
            );

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
};

export const getAllOrderByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Kiểm tra xem userId có hợp lệ hay không
        const user = await User.findByPk(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng." });
        }

        // Lấy tất cả đơn hàng của người dùng
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]], // Sắp xếp theo thời gian tạo mới nhất
        });

        if (orders.length === 0) {
            return res
                .status(200)
                .json({ message: "Người dùng chưa có đơn hàng nào." });
        }

        // Trả về danh sách đơn hàng
        return res
            .status(200)
            .json({ message: "Lấy danh sách đơn hàng thành công.", orders });
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        return res
            .status(500)
            .json({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.params; // Lấy order_id từ URL
        const { status } = req.body; // Lấy trạng thái mới từ body request

        // Kiểm tra xem trạng thái được cung cấp có hợp lệ không
        const validStatuses = ["Chờ duyệt", "Hoàn thành", "Huỷ bỏ"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                ec: 0,
                message: "Trạng thái không hợp lệ.",
            });
        }

        // Tìm đơn hàng cần cập nhật
        const order = await Order.findByPk(order_id);
        if (!order) {
            return res.status(404).json({
                ec: 0,
                message: "Đơn hàng không tồn tại.",
            });
        }

        // Nếu trạng thái là "Hoàn thành", trừ số lượng sản phẩm
        if (status === "Hoàn thành") {
            const orderDetails = await OrderDetail.findAll({
                where: { order_id: order_id },
            });

            for (const detail of orderDetails) {
                const product = await Product.findByPk(detail.product_id);
                if (product) {
                    // Kiểm tra nếu số lượng trong kho đủ
                    if (product.quantity < detail.quantity) {
                        return res.status(400).json({
                            ec: 0,
                            message: `Sản phẩm ${product.name} không đủ số lượng trong kho.`,
                        });
                    }

                    // Trừ số lượng sản phẩm
                    product.quantity -= detail.quantity;
                    await product.save();
                }
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.status = status;
        await order.save();

        return res.status(200).json({
            ec: 1,
            message: "Cập nhật trạng thái đơn hàng thành công.",
            order,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({
            ec: 0,
            message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
        });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { order_id } = req.params;

        // Tìm đơn hàng
        const order = await Order.findByPk(order_id);
        if (!order) {
            return res.status(404).json({
                ec: 0,
                message: "Đơn hàng không tồn tại.",
            });
        }

        // Kiểm tra trạng thái
        if (order.status !== "Hoàn thành" && order.status !== "Huỷ bỏ") {
            return res.status(400).json({
                ec: 0,
                message:
                    "Chỉ có thể xóa đơn hàng khi trạng thái là Hoàn thành hoặc Huỷ bỏ.",
            });
        }

        // Xóa đơn hàng
        await order.destroy();
        return res.status(200).json({
            ec: 1,
            message: "Xóa đơn hàng thành công.",
        });
    } catch (error) {
        console.error("Error deleting order:", error);
        return res.status(500).json({
            ec: 0,
            message: "Có lỗi xảy ra khi xóa đơn hàng.",
        });
    }
};

export const getOrderProducts = async (req, res) => {
    try {
        const { order_id } = req.params;

        if (!order_id) {
            return res.status(400).json({
                ec: 0,
                message: "Vui lòng cung cấp order_id",
            });
        }

        const orderDetails = await OrderDetail.findAll({
            where: { order_id },
            include: [
                {
                    model: Product,
                    attributes: [
                        "product_id",
                        "name",
                        "price",
                        "quantity",
                        "image_url",
                    ],
                },
            ],
        });

        if (!orderDetails || orderDetails.length === 0) {
            return res.status(404).json({
                ec: 0,
                message: "Không tìm thấy sản phẩm trong đơn hàng.",
            });
        }

        // Biến đổi dữ liệu
        const transformedData = orderDetails.map((detail) => {
            const detailObject = detail.toJSON ? detail.toJSON() : detail;

            const { Product, ...rest } = detailObject;

            return {
                ...rest,
                ...Product, // Merge Product fields directly
                image_url: Product?.image_url
                    ? JSON.parse(Product.image_url)
                    : [],
            };
        });

        return res.status(200).json({
            ec: 1,
            message: "Lấy danh sách sản phẩm thành công.",
            data: transformedData,
        });
    } catch (error) {
        console.error("Error fetching order products:", error);
        return res.status(500).json({
            ec: 0,
            message: "Có lỗi xảy ra khi lấy danh sách sản phẩm.",
        });
    }
};
