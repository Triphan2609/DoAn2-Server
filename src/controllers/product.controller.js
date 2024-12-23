import { models } from "../config/database.js";
import { Op } from "sequelize"; // Import Op for Sequelize operators
import moment from "moment"; // Import moment.js to handle date manipulation
import fs from "fs";
import path from "path";

const { Product, Category, Brand, ProductType } = models; // Lấy User từ models đã khởi tạo

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};

export const getAllProductsPaginationAdmin = async (req, res) => {
    const { page, limit } = req.query; // Lấy page và limit từ query parameters

    const offset = (page - 1) * limit; // Tính toán offset cho phân trang

    try {
        // Lấy tất cả sản phẩm với thông tin liên quan từ các bảng khác (brand, product_type, category)
        const products = await Product.findAndCountAll({
            limit: parseInt(limit), // Số lượng sản phẩm trên mỗi trang
            offset: parseInt(offset), // Bắt đầu từ record nào
            order: [["created_at", "DESC"]], // Sắp xếp theo ngày tạo
            include: [
                {
                    model: Brand,
                    attributes: ["name"], // Lấy tên của brand
                },
                {
                    model: ProductType,
                    attributes: ["name"], // Lấy tên của product_type
                },
                {
                    model: Category,
                    attributes: ["name"], // Lấy tên của category
                },
            ],
        });

        // Trả về kết quả
        res.json({
            totalProducts: products.count, // Tổng số sản phẩm
            totalPages: Math.ceil(products.count / limit), // Tổng số trang
            currentPage: page, // Trang hiện tại
            products: products.rows.map((product) => {
                // Kiểm tra và đảm bảo image_url là mảng
                const imageUrls = Array.isArray(product.image_url)
                    ? product.image_url
                    : [product.image_url];

                return {
                    ...product.toJSON(), // Lấy tất cả các thuộc tính của sản phẩm
                    brand_name: product.Brand.name, // Thêm tên thương hiệu
                    product_type_name: product.ProductType.name, // Thêm tên loại sản phẩm
                    category_name: product.Category.name, // Thêm tên danh mục
                    image_url: JSON.parse(imageUrls), // Trả về image_url như một mảng
                };
            }), // Thêm tên thương hiệu, loại sản phẩm và danh mục vào mỗi sản phẩm
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
    }
};

export const getNewProducts = async (req, res) => {
    try {
        // Get the date 5 days ago
        const fiveDaysAgo = moment().subtract(5, "days").toDate();

        // Lấy sản phẩm có ngày tạo trong 5 ngày gần nhất
        const products = await Product.findAll({
            where: {
                created_at: {
                    [Op.gt]: fiveDaysAgo, //
                },
            },
            limit: 10,
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
    }
};

export const getAllProductsLimit10 = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const products = await Product.findAll({
            where: {
                quantity: {
                    [Op.gt]: 10, // Sử dụng Op.gt để lọc số lượng lớn hơn 100
                },
            },
            limit: 10,
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};

export const getProductsByType = async (req, res) => {
    try {
        // Lấy product_type_id từ query parameter
        const { product_type_id } = req.query;

        // Kiểm tra xem có truyền product_type_id hay không
        if (!product_type_id) {
            return res
                .status(400)
                .json({ message: "ID loại sản phẩm là bắt buộc" });
        }

        // Lấy tất cả sản phẩm có product_type_id tương ứng
        const products = await Product.findAll({
            limit: 3,
            where: {
                product_type_id: {
                    [Op.eq]: product_type_id, // Tìm sản phẩm có product_type_id khớp
                },
            },
            required: true, // Chỉ lấy các sản phẩm có loại sản phẩm phù hợp
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo ID loại:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách sản phẩm theo ID loại",
        });
    }
};

export const getAllProductsPagination = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "ASC",
            brand,
            priceRange,
        } = req.query;

        // Parsing và kiểm tra tính hợp lệ của page và limit
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        if (isNaN(limitInt) || limitInt <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
        }

        const offset = (pageInt - 1) * limitInt;

        // Kiểm tra các trường hợp sắp xếp hợp lệ
        const validSortFields = ["createdAt", "price", "name"];
        const validSortOrders = ["ASC", "DESC"];

        const sortColumn = validSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";
        const sortDirection = validSortOrders.includes(sortOrder)
            ? sortOrder
            : "ASC";

        const order = [[sortColumn, sortDirection]];

        const whereConditions = {};

        // Xử lý lọc theo thương hiệu
        if (brand) {
            const brandArray = brand.split(",");
            if (brandArray.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid brand format" });
            }
            whereConditions.brand_id = { [Op.in]: brandArray };
        }

        // Xử lý lọc theo khoảng giá
        if (priceRange) {
            const priceRanges = priceRange.split(","); // Tách các khoảng giá bằng dấu phẩy
            const priceConditions = priceRanges
                .map((range) => {
                    const [minPrice, maxPrice] = range.split("-").map(Number);
                    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                        return {
                            price: { [Op.between]: [minPrice, maxPrice] },
                        };
                    }
                    return null;
                })
                .filter((condition) => condition !== null); // Loại bỏ các khoảng giá không hợp lệ

            if (priceConditions.length > 0) {
                whereConditions[Op.or] = priceConditions; // Kết hợp các điều kiện giá bằng logic OR
            } else {
                return res
                    .status(400)
                    .json({ message: "Invalid price range format" });
            }
        }

        // Lấy sản phẩm với phân trang, sắp xếp và các bộ lọc
        const products = await Product.findAll({
            where: whereConditions,
            limit: limitInt,
            offset: offset,
            order: order,
        });

        const totalProducts = await Product.count({ where: whereConditions });
        const totalPages = Math.ceil(totalProducts / limitInt);

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageInt,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limitInt,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy tất cả sản phẩm" });
    }
};

export const getAllProductsCategoriesPagination = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "ASC",
            brand,
            priceRange,
            category, // Keep category parameter as a single category ID
        } = req.query;

        // Parsing và kiểm tra tính hợp lệ của page và limit
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        if (isNaN(limitInt) || limitInt <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
        }

        const offset = (pageInt - 1) * limitInt;

        // Kiểm tra các trường hợp sắp xếp hợp lệ
        const validSortFields = ["createdAt", "price", "name"];
        const validSortOrders = ["ASC", "DESC"];

        const sortColumn = validSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";
        const sortDirection = validSortOrders.includes(sortOrder)
            ? sortOrder
            : "ASC";

        const order = [[sortColumn, sortDirection]];

        const whereConditions = {};

        // Xử lý lọc theo thương hiệu
        if (brand) {
            const brandArray = brand.split(",");
            if (brandArray.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid brand format" });
            }
            whereConditions.brand_id = { [Op.in]: brandArray };
        }

        // Xử lý lọc theo khoảng giá
        if (priceRange) {
            const priceRanges = priceRange.split(","); // Tách các khoảng giá bằng dấu phẩy
            const priceConditions = priceRanges
                .map((range) => {
                    const [minPrice, maxPrice] = range.split("-").map(Number);
                    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                        return {
                            price: { [Op.between]: [minPrice, maxPrice] },
                        };
                    }
                    return null;
                })
                .filter((condition) => condition !== null); // Loại bỏ các khoảng giá không hợp lệ

            if (priceConditions.length > 0) {
                whereConditions[Op.or] = priceConditions; // Kết hợp các điều kiện giá bằng logic OR
            } else {
                return res
                    .status(400)
                    .json({ message: "Invalid price range format" });
            }
        }

        // Xử lý lọc theo danh mục (category), chỉ lấy 1 category_id
        if (category) {
            whereConditions.category_id = category; // Lọc theo category_id
        }

        // Lấy sản phẩm với phân trang, sắp xếp và các bộ lọc
        const products = await Product.findAll({
            where: whereConditions,
            limit: limitInt,
            offset: offset,
            order: order,
        });

        const totalProducts = await Product.count({ where: whereConditions });
        const totalPages = Math.ceil(totalProducts / limitInt);

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageInt,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limitInt,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy tất cả sản phẩm" });
    }
};

export const getAllProductsAnimalPagination = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "ASC",
            brand,
            priceRange,
            animalId,
        } = req.query;

        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        if (isNaN(limitInt) || limitInt <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
        }

        const offset = (pageInt - 1) * limitInt;

        const validSortFields = ["createdAt", "price", "name"];
        const validSortOrders = ["ASC", "DESC"];

        const sortColumn = validSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";
        const sortDirection = validSortOrders.includes(sortOrder)
            ? sortOrder
            : "ASC";

        const order = [[sortColumn, sortDirection]];

        const whereConditions = {};

        if (brand) {
            const brandArray = brand.split(",");
            if (brandArray.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Invalid brand format" });
            }
            whereConditions.brand_id = { [Op.in]: brandArray };
        }

        if (priceRange) {
            const priceRanges = priceRange.split(",");
            const priceConditions = priceRanges
                .map((range) => {
                    const [minPrice, maxPrice] = range.split("-").map(Number);
                    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                        return {
                            price: { [Op.between]: [minPrice, maxPrice] },
                        };
                    }
                    return null;
                })
                .filter((condition) => condition !== null);

            if (priceConditions.length > 0) {
                whereConditions[Op.or] = priceConditions;
            } else {
                return res
                    .status(400)
                    .json({ message: "Invalid price range format" });
            }
        }

        const products = await Product.findAll({
            where: whereConditions,
            limit: limitInt,
            offset: offset,
            order: order,
            include: [
                {
                    model: Category,
                    where: { animal_id: animalId },
                    required: true,
                    attributes: [],
                },
            ],
            logging: console.log, // This will log the SQL query
        });

        const totalProducts = await Product.count({
            where: whereConditions,
            include: [
                {
                    model: Category,
                    where: { animal_id: animalId },
                    required: true,
                },
            ],
        });

        const totalPages = Math.ceil(totalProducts / limitInt);

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageInt,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limitInt,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

export const getProductDetails = async (req, res) => {
    try {
        const slug = req.params.slug; // Lấy slug từ params

        // Lấy thông tin chi tiết của sản phẩm theo slug
        const product = await Product.findOne({ where: { slug } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ product });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ message: "Error fetching product details" });
    }
};

export const getAllProductsType = async (req, res) => {
    try {
        // Lấy tất cả categories từ cơ sở dữ liệu
        const product_type = await ProductType.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(product_type);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh mục" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            quantity,
            category_id,
            brand_id,
            product_type_id,
        } = req.body;

        let imageUrls = []; // Mảng lưu các đường dẫn hình ảnh

        if (req.files) {
            // Lưu các đường dẫn ảnh đã tải lên
            imageUrls = req.files.map((file) => `${file.filename}`);
        }

        // Nếu lưu dưới dạng chuỗi JSON
        const imageUrlsString = JSON.stringify(imageUrls);

        // Tạo sản phẩm với nhiều hình ảnh
        const product = await Product.create({
            name,
            description,
            price,
            quantity,
            image_url: imageUrlsString, // Lưu chuỗi JSON vào cơ sở dữ liệu
            category_id,
            brand_id,
            product_type_id,
        });

        return res.status(201).json({
            ec: 1,
            message: "Sản phẩm được tạo thành công",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res
            .status(500)
            .json({ ec: 0, message: "Đã có lỗi xảy ra khi tạo sản phẩm" });
    }
};

export const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const {
        name,
        description,
        price,
        quantity,
        category_id,
        brand_id,
        product_type_id,
    } = req.body;
    console.log(name);

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        // Cập nhật thông tin sản phẩm
        product.name = name;
        product.description = description;
        product.price = price;
        product.quantity = quantity;
        product.category_id = category_id;
        product.brand_id = brand_id;
        product.product_type_id = product_type_id;

        await product.save();

        res.status(200).json({
            ec: 1,
            message: "Cập nhật sản phẩm thành công",
            product,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            ec: 0,
            message: "Đã xảy ra lỗi khi cập nhật sản phẩm",
        });
    }
};

export const deleteProduct = async (req, res) => {
    const { productId } = req.params; // Lấy ID từ params

    try {
        // Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                message: "Sản phẩm không tồn tại",
            });
        }

        // Xoá sản phẩm
        await product.destroy();

        // Phản hồi xoá thành công
        return res.status(200).json({
            ec: 1,
            message: "Sản phẩm đã được xoá thành công",
        });
    } catch (error) {
        console.error("Lỗi xoá sản phẩm:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã xảy ra lỗi khi xoá sản phẩm",
            error: error.message,
        });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const { searchQuery } = req.query; // Lấy từ khóa tìm kiếm từ query string
        console.log(searchQuery);

        if (!searchQuery) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
        }

        // Tìm kiếm sản phẩm theo tên hoặc mô tả
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQuery}%` } },
                    { description: { [Op.like]: `%${searchQuery}%` } },
                ],
            },
        });

        if (!products.length) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy sản phẩm nào" });
        }

        return res.status(200).json({ products });
    } catch (error) {
        console.error("Error searching products:", error);
        return res
            .status(500)
            .json({ message: "Đã có lỗi khi tìm kiếm sản phẩm" });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { productId, imageName } = req.query;

        // Tìm sản phẩm theo ID
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                ec: 0,
                message: "Sản phẩm không tồn tại",
            });
        }

        // Lấy danh sách hình ảnh từ cơ sở dữ liệu
        let imageUrls = JSON.parse(product.image_url || "[]");

        // Kiểm tra nếu chỉ còn một hình ảnh, không cho phép xóa
        if (imageUrls.length === 1) {
            return res.status(400).json({
                ec: 0,
                message:
                    "Không thể xóa hình ảnh cuối cùng. Mỗi sản phẩm phải có ít nhất một hình ảnh.",
            });
        }

        // Kiểm tra xem hình ảnh có tồn tại trong danh sách hay không
        if (!imageUrls.includes(imageName)) {
            return res.status(404).json({
                ec: 0,
                message: "Hình ảnh không tồn tại trong sản phẩm",
            });
        }

        // Xóa hình ảnh khỏi danh sách
        imageUrls = imageUrls.filter((image) => image !== imageName);

        // Cập nhật cơ sở dữ liệu với danh sách mới
        product.image_url = JSON.stringify(imageUrls);
        await product.save();

        // Xóa tệp hình ảnh khỏi hệ thống tệp
        const filePath = path.join("public", imageName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({
            ec: 1,
            message: "Hình ảnh đã được xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi xóa hình ảnh",
        });
    }
};

export const updateAllImages = async (req, res) => {
    try {
        const { productId, oldImages } = req.body;

        // Tìm sản phẩm
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                ec: 0,
                message: "Sản phẩm không tồn tại",
            });
        }

        // Chuyển chuỗi phân cách bằng dấu phẩy thành mảng nếu cần thiết
        const imagesToDelete = Array.isArray(oldImages)
            ? oldImages
            : oldImages.split(",");

        // Xóa tất cả hình ảnh cũ khỏi hệ thống
        imagesToDelete.forEach((image) => {
            const filePath = path.join("public", image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Thêm hình ảnh mới
        const newImageUrls = req.files.map((file) => file.filename);

        // Cập nhật cơ sở dữ liệu với danh sách hình ảnh mới
        product.image_url = JSON.stringify(newImageUrls);
        await product.save();

        return res.status(200).json({
            ec: 1,
            message: "Cập nhật hình ảnh thành công",
            updatedImages: newImageUrls,
        });
    } catch (error) {
        console.error("Error updating images:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi cập nhật hình ảnh",
        });
    }
};

export const updateSingleImage = async (req, res) => {
    try {
        const { productId, oldImage } = req.body;
        console.log(oldImage);

        // Tìm sản phẩm
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                ec: 0,
                message: "Sản phẩm không tồn tại",
            });
        }

        // Lấy danh sách hình ảnh hiện tại từ cơ sở dữ liệu
        let imageUrls = JSON.parse(product.image_url || "[]");

        // Xóa hình ảnh cũ khỏi hệ thống
        const filePath = path.join("public", oldImage);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Thêm hình ảnh mới
        const newImageUrl = req.file.filename;
        console.log(imageUrls, oldImage);

        // Thay thế hình ảnh cũ bằng hình ảnh mới trong danh sách
        imageUrls = imageUrls.map((image) =>
            image === oldImage ? newImageUrl : image
        );

        // Cập nhật cơ sở dữ liệu
        product.image_url = JSON.stringify(imageUrls);
        await product.save();

        return res.status(200).json({
            ec: 1,
            message: "Cập nhật hình ảnh thành công",
            updatedImages: imageUrls,
        });
    } catch (error) {
        console.error("Error updating image:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi cập nhật hình ảnh",
        });
    }
};

export const getAllProductsImages = async (req, res) => {
    try {
        // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        const products = await Product.findAll();

        // Lấy tất cả hình ảnh từ các sản phẩm
        const allImages = products
            .map((product) => {
                // Parse image_url từ chuỗi JSON
                const images = JSON.parse(product.image_url || "[]");
                return images;
            })
            .flat(); // Làm phẳng mảng các mảng hình ảnh thành một mảng duy nhất

        // Trả về danh sách hình ảnh
        res.status(200).json(allImages);
    } catch (error) {
        console.error("Error fetching product images:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách hình ảnh sản phẩm",
        });
    }
};

export const addImages = async (req, res) => {
    try {
        const { productId } = req.body;

        // Tìm sản phẩm theo ID
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                ec: 0,
                message: "Sản phẩm không tồn tại",
            });
        }

        // Lấy danh sách hình ảnh hiện tại
        let currentImages = JSON.parse(product.image_url || "[]");

        // Thêm hình ảnh mới vào danh sách
        const newImages = req.files.map((file) => file.filename);
        currentImages = [...currentImages, ...newImages];

        // Cập nhật cơ sở dữ liệu
        product.image_url = JSON.stringify(currentImages);
        await product.save();

        return res.status(200).json({
            ec: 1,
            message: "Hình ảnh đã được thêm thành công",
            updatedImages: currentImages,
        });
    } catch (error) {
        console.error("Error adding images:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi thêm hình ảnh",
        });
    }
};
