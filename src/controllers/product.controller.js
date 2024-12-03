import { models } from "../config/database.js";
import { Op, Sequelize } from "sequelize"; // Import Op for Sequelize operators
import moment from "moment"; // Import moment.js to handle date manipulation

const { Product, ProductType, Category, Animal } = models; // Lấy User từ models đã khởi tạo

// Lấy tất cả các thương hiệu
export const getAllProducts = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const products = await Product.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
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
                    [Op.gt]: 100, // Sử dụng Op.gt để lọc số lượng lớn hơn 100
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

        // Debugging the where conditions
        console.log("Where conditions: ", whereConditions);

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
            imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
        }

        // Tạo sản phẩm với nhiều hình ảnh
        const product = await Product.create({
            name,
            description,
            price,
            quantity,
            image_urls: imageUrls, // Lưu mảng đường dẫn hình ảnh vào cơ sở dữ liệu
            category_id,
            brand_id,
            product_type_id,
        });

        return res.status(201).json({
            message: "Sản phẩm được tạo thành công",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res
            .status(500)
            .json({ message: "Đã có lỗi xảy ra khi tạo sản phẩm" });
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
