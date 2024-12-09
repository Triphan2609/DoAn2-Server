const checkout = async (req, res) => {
    const { userId, cartItems, totalPrice } = req.body; // Dữ liệu từ client: userId và danh sách sản phẩm trong giỏ hàng

    if (!userId || !cartItems || cartItems.length === 0) {
        return res
            .status(400)
            .json({ message: "Thông tin đơn hàng không hợp lệ" });
    }

    // let totalPrice = 0;
    // for (let item of cartItems) {
    //     const product = await ProductModel.findByPk(item.productId); // Lấy sản phẩm từ database
    //     if (product) {
    //         totalPrice += product.price * item.quantity;
    //     }
    // }

    // Tạo đơn hàng trong bảng 'orders'
    const newOrder = await OrderModel.create({
        user_id: userId,
        total_price: totalPrice,
        status: "pending", // Trạng thái đơn hàng ban đầu là 'pending'
    });

    // Bước 3: Tạo các chi tiết đơn hàng trong bảng 'order_details'
    for (let item of cartItems) {
        const product = await ProductModel.findByPk(item.productId);
        if (product) {
            await OrderDetailModel.create({
                order_id: newOrder.order_id,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: product.price,
            });
        }
    }

    // Bước 4: Trả về thông tin đơn hàng và thanh toán
    res.json({
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
