// seeder.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ==================== اتصال به دیتابیس ====================
const MONGODB_URI = "mongodb+srv://admin-shop:ByWomrKw8XMcpY04@cluster0.lo2hzic.mongodb.net/shopdb?appName=Cluster0"

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ Connection error:', err);
        process.exit(1);
    });

// ==================== مدل‌ها ====================

// Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
}, { timestamps: true });

categorySchema.pre('save', function () {
    if (!this.slug || this.isModified('name')) {
        this.slug = this.name.trim().toLowerCase().replace(/\s+/g, "-");
    }
});
const Category = mongoose.model('Category', categorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, minlength: 10 },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
}, { timestamps: true });

productSchema.pre('save', async function () {
    if (this.title && (!this.slug || this.isModified('title'))) {
        this.slug = this.title.trim().toLowerCase().replace(/\s+/g, "-");
    }
});
const Product = mongoose.model('Product', productSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 3 },
    lastName: { type: String, required: true, trim: true, minlength: 3 },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
const User = mongoose.model('User', userSchema);

// Address Schema
const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });

addressSchema.pre('save', async function () {
    if (this.isDefault) {
        await Address.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});
const Address = mongoose.model('Address', addressSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    isVerified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
}, { timestamps: true });
const Review = mongoose.model('Review', reviewSchema);

// Order Schema
const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true }
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const OrderModel = this.constructor;
        const count = await OrderModel.countDocuments();
        this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(4, "0")}`;
    }
});
const Order = mongoose.model('Order', orderSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1000 },
    transactionCode: { type: String, unique: true, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, default: 'online' },
    description: { type: String, required: true },
    paidAt: { type: Date },
}, { timestamps: true });
const Payment = mongoose.model('Payment', paymentSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'read', 'replied'], default: 'pending' },
}, { timestamps: true });
const Contact = mongoose.model('Contact', contactSchema);

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    summary: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    views: { type: Number, default: 0 },
}, { timestamps: true });

blogSchema.pre('save', function () {
    if (this.title && !this.slug) {
        this.slug = this.title.trim().toLowerCase().replace(/\s+/g, "-");
    }
});
const Blog = mongoose.model('Blog', blogSchema);

// ==================== دیتا ====================

// دسته‌بندی‌های ابزارآلات
const categoriesData = [
    { name: 'ابزار دستی' },
    { name: 'ابزار برقی' },
    { name: 'ابزار بادی' },
    { name: 'ابزار باغبانی' },
    { name: 'ابزار اندازه‌گیری' },
    { name: 'ابزار جوشکاری' },
    { name: 'ابزار نجاری' },
    { name: 'ابزار تعمیرات خودرو' },
    { name: 'ابزار ساختمانی' },
    { name: 'تجهیزات ایمنی' },
    { name: 'پیچ و مهره و یراق' },
    { name: 'رنگ و ابزار نقاشی' },
];

// محصولات ابزارآلات
const getProductsData = (categoryIds) => [
    // ابزار دستی
    { title: 'آچار سوکت بکس 12 عددی', description: 'ست آچار سوکت بکس 12 عددی با کیفیت بالا، مناسب برای تعمیرات خودرو و صنعتی', price: 450000, stock: 50, category: categoryIds[0], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/05/19/thumbnail/20240519163336-سری-ابزار-دستی.jpg'] },
    { title: 'ست پیچ گوشتی 8 عددی', description: 'ست پیچ گوشتی شارپ 8 عددی با مغناطیس قوی و دسته ضد لغزش', price: 180000, stock: 100, category: categoryIds[0], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/20/thumbnail/20240220150239-ابزار-دستی.jpg'] },
    { title: 'انبردست دسته دار 6 اینچ', description: 'انبردست فولادی با روکش کروم و دسته پلاستیکی ضد برق', price: 85000, stock: 80, category: categoryIds[0], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/01/15/thumbnail/20240115123000-انبردست.jpg'] },
    { title: 'آچار فرانسه 10 اینچ', description: 'آچار فرانسه فنری با کیفیت آلمان، سایز 10 اینچ', price: 120000, stock: 60, category: categoryIds[0], images: ['https://cdn.romaak.com/upload/editor/products/images/2023/12/01/thumbnail/20231201114500-آچار-فرانسه.jpg'] },

    // ابزار برقی
    { title: 'دریل برقی 850 وات', description: 'دریل برقی رونیکس 850 وات با قابلیت ضربه و 2 حالت سرعت', price: 1850000, stock: 25, category: categoryIds[1], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/10/thumbnail/20240310142000-دریل-برقی.jpg'] },
    { title: 'مینی فرز 750 وات', description: 'مینی فرز بوش 750 وات با قفل اسپیندل و دسته قابل تنظیم', price: 2200000, stock: 20, category: categoryIds[1], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/25/thumbnail/20240225153000-مینی-فرز.jpg'] },
    { title: 'اره عمودبر 1200 وات', description: 'اره عمودبر 1200 وات با صفحه چرخان و سیستم گردگیری', price: 3500000, stock: 15, category: categoryIds[1], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/01/30/thumbnail/20240130121500-اره-عمودبر.jpg'] },
    { title: 'پیکان برقی 1200 وات', description: 'پیکان برقی 1200 وات مناسب برای دکل های حفاری و ژئوتکنیک و بهینه سازی شده برای کارهای معدنی', price: 4200000, stock: 45, category: categoryIds[1], images: ['https://ik.imagekit.io/jrwq9omor/photo_2025-10-23_17-15-17.jpg'] },

    // ابزار بادی
    { title: 'بادزن پمپ باد 3 لیتر', description: 'کمپرسور باد 3 لیتر 1 اسب بخار مناسب برای باد کردن لاستیک و ابزار بادی', price: 2800000, stock: 12, category: categoryIds[2], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/05/thumbnail/20240405131000-کمپرسور-باد.jpg'] },
    { title: 'چکش بادی 2 اینچ', description: 'چکش بادی دو اینچ با قدرت ضربه بالا مناسب برای بدنه خودرو', price: 1500000, stock: 18, category: categoryIds[2], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/20/thumbnail/20240320164500-چکش-بادی.jpg'] },

    // ابزار باغبانی
    { title: 'چمن زن برقی 1200 وات', description: 'چمن زن برقی جمع و جور با ارتفاع قابل تنظیم و جمع‌کننده چمن', price: 2900000, stock: 22, category: categoryIds[3], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/18/thumbnail/20240418121000-چمن-زن.jpg'] },
    { title: 'قیچی هرس حرفه‌ای', description: 'قیچی هرس باغبانی با تیغه فولادی تیز و دسته ضد لغزش', price: 280000, stock: 35, category: categoryIds[3], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/05/thumbnail/20240305140000-قیچی-هرس.jpg'] },
    { title: ' اره برقی زنجیری 1800 وات', description: 'اره برقی زنجیری با قدرت بالا مناسب برای برش درختان', price: 4500000, stock: 8, category: categoryIds[3], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/10/thumbnail/20240210151500-اره-برقی.jpg'] },

    // ابزار اندازه گیری
    { title: 'متر لیزری 50 متر', description: 'متر لیزری با برد 50 متر و دقت 1 میلی متر، مناسب برای نقشه برداری', price: 980000, stock: 30, category: categoryIds[4], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/25/thumbnail/20240425112000-متر-لیزری.jpg'] },
    { title: 'کولیس دیجیتال 150 میلیمتر', description: 'کولیس دیجیتال فلزی با دقت 0.01 میلی متر', price: 420000, stock: 45, category: categoryIds[4], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/15/thumbnail/20240315133000-کولیس-دیجیتال.jpg'] },
    { title: 'گونیای فلزی 30 سانتی', description: 'گونیای فلزی با زاویه قائم دقیق مناسب برای نجاری', price: 150000, stock: 55, category: categoryIds[4], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/20/thumbnail/20240220104500-گونیا.jpg'] },

    // ابزار جوشکاری
    { title: 'دستگاه جوش اینورتر 200 آمپر', description: 'دستگاه جوش اینورتر دوکاره با جریان 200 آمپر', price: 5500000, stock: 10, category: categoryIds[5], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/28/thumbnail/20240328145500-دستگاه-جوش.jpg'] },
    { title: 'کلاه جوش خودکار', description: 'کلاه جوش حرفه‌ای با صفحه خودکار و محافظ UV', price: 850000, stock: 25, category: categoryIds[5], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/14/thumbnail/20240214180000-کلاه-جوش.jpg'] },

    // ابزار نجاری
    { title: 'رنده برقی 1500 وات', description: 'رنده برقی بوش با عرض رنده 82 میلی متر', price: 3200000, stock: 15, category: categoryIds[6], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/22/thumbnail/20240322162000-رنده-برقی.jpg'] },
    { title: 'فرز انگشتی 600 وات', description: 'فرز انگشتی با گیربکس فلزی و 6 دور متغیر', price: 1800000, stock: 20, category: categoryIds[6], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/02/28/thumbnail/20240228111000-فرز-انگشتی.jpg'] },

    // ابزار تعمیرات خودرو
    { title: 'دستگاه دیاگ Z5', description: 'دستگاه دیاگ زد5 حرفه‌ای برای عیب یابی خودروهای ایرانی و خارجی', price: 18500000, stock: 5, category: categoryIds[7], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/12/thumbnail/20240412123500-دستگاه-دیاگ.jpg'] },
    { title: 'جک سقفی 3 تنی', description: 'جک سقفی هیدرولیک 3 تنی با دو بازوی ایمنی', price: 4850000, stock: 12, category: categoryIds[7], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/18/thumbnail/20240318134500-جک-سقفی.jpg'] },

    // ابزار ساختمانی
    { title: 'بتون کن 1200 وات', description: 'بتون کن 1200 وات با قابلیت تنظیم دور و ضربه', price: 3900000, stock: 18, category: categoryIds[8], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/08/thumbnail/20240408155000-بتون-کن.jpg'] },
    { title: 'فرغون 300 لیتری', description: 'فرغون ساختمانی با چرخ پنوماتیک و بدنه گالوانیزه', price: 1850000, stock: 30, category: categoryIds[8], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/12/thumbnail/20240312102000-فرغون.jpg'] },

    // تجهیزات ایمنی
    { title: 'کلاه ایمنی صنعتی', description: 'کلاه ایمنی صنعتی با استاندارد ANSI و بند قابل تنظیم', price: 185000, stock: 100, category: categoryIds[9], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/02/thumbnail/20240402144500-کلاه-ایمنی.jpg'] },
    { title: 'دستکش کار ضخیم', description: 'دستکش کار چرمی با کفی ضخیم و مقاوم در برابر برش', price: 95000, stock: 200, category: categoryIds[9], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/25/thumbnail/20240325130000-دستکش-کار.jpg'] },

    // پیچ و مهره
    { title: 'ست پیچ و مهره 200 عددی', description: 'ست پیچ و مهره با دامنه سایز M4 تا M12، مناسب برای مصارف صنعتی', price: 320000, stock: 75, category: categoryIds[10], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/03/30/thumbnail/20240330141500-پیچ-و-مهره.jpg'] },

    // ابزار رنگ و نقاشی
    { title: 'تفنگ رنگ پاش 600 سی سی', description: 'تفنگ رنگ پاش بادی با نازل 1.5 میلی متر و مخزن 600 سی سی', price: 680000, stock: 25, category: categoryIds[11], images: ['https://cdn.romaak.com/upload/editor/products/images/2024/04/20/thumbnail/20240420172500-تفنگ-رنگ.jpg'] },
];

// مقالات بلاگ (ابزارآلات)
const blogsData = [
    {
        title: 'راهنمای خرید دریل برقی مناسب برای مصارف خانگی',
        summary: 'در این مقاله به بررسی نکات مهم برای خرید دریل برقی خانگی می‌پردازیم و بهترین مدل‌ها را معرفی می‌کنیم.',
        content: 'دریل برقی یکی از پرکاربردترین ابزارآلات برقی در هر خانه‌ای است. برای انتخاب دریل مناسب باید به عواملی مانند توان موتور، سرعت، گشتاور، وزن و... توجه کنید...',
        author: 'رضا کریمی',
        tags: ['دریل برقی', 'ابزار برقی', 'راهنمای خرید'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/05/01/thumbnail/20240501120000-دریل-برقی.jpg'
    },
    {
        title: 'انواع آچار و کاربردهای هر کدام در تعمیرات',
        summary: 'آشنایی با انواع آچارها از جمله آچار فرانسه، بکس، آلن و کاربردهای هر یک در تعمیرات خودرو و صنعتی',
        content: 'آچارها یکی از مهمترین ابزارهای دستی هستند که در انواع مختلف طراحی شده‌اند. آچار فرانسه برای پیچ‌های با سایز متغیر، آچار بکس برای پیچ‌های خش...',
        author: 'سعید محمدی',
        tags: ['آچار', 'ابزار دستی', 'تعمیرات'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/04/28/thumbnail/20240428113000-انواع-آچار.jpg'
    },
    {
        title: 'نحوه صحیح استفاده و نگهداری از مینی فرز',
        summary: 'راهنمای کامل استفاده ایمن از مینی فرز و نکات نگهداری برای افزایش عمر دستگاه',
        content: 'مینی فرز یکی از پرخطرترین ابزارهای برقی است که استفاده نادرست از آن می‌تواند خطرات جدی ایجاد کند. در این مقاله به نکات ایمنی و نگهداری می‌پردازیم...',
        author: 'علی حسینی',
        tags: ['مینی فرز', 'ابزار برقی', 'ایمنی'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/04/25/thumbnail/20240425150000-مینی-فرز.jpg'
    },
    {
        title: 'معرفی بهترین برندهای ابزارآلات صنعتی',
        summary: 'بررسی برندهای معتبر ابزارآلات مانند بوش، متابو، دِوالت و رونیکس و مقایسه کیفیت و قیمت آن‌ها',
        content: 'در بازار ابزارآلات برندهای مختلفی وجود دارند. برندهایی مانند بوش آلمان، متابو آلمان، دِوالت آمریکا و رونیکس ایران از معروف‌ترین‌ها هستند...',
        author: 'مهدی رضایی',
        tags: ['برند ابزار', 'بوش', 'متابو', 'رونیکس'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/04/22/thumbnail/20240422143000-برند-ابزار.jpg'
    },
    {
        title: 'تکنیک‌های حرفه‌ای جوشکاری با دستگاه اینورتر',
        summary: 'آموزش تکنیک‌های پیشرفته جوشکاری با دستگاه‌های اینورتر برای جوشکاران حرفه‌ای',
        content: 'دستگاه‌های جوش اینورتر به دلیل وزن کم و مصرف انرژی پایین محبوبیت زیادی دارند. در این مقاله تکنیک‌های حرفه‌ای جوشکاری را آموزش می‌دهیم...',
        author: 'امیرحسین نوروزی',
        tags: ['جوشکاری', 'اینورتر', 'آموزش'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/04/18/thumbnail/20240418103000-جوشکاری.jpg'
    },
    {
        title: 'ابزارهای ضروری برای یک کارگاه نجاری حرفه‌ای',
        summary: 'لیست کامل ابزارهای مورد نیاز برای راه‌اندازی یک کارگاه نجاری همراه با قیمت‌های تقریبی',
        content: 'اگر قصد راه‌اندازی کارگاه نجاری دارید باید ابزارهایی مانند اره میز، رنده برقی، فرز نجاری، سنباده لرزان و... را تهیه کنید...',
        author: 'حسن مرادی',
        tags: ['نجاری', 'ابزار چوب', 'کارگاه'],
        image: 'https://cdn.romaak.com/upload/editor/blogs/images/2024/04/15/thumbnail/20240415164500-کارگاه-نجاری.jpg'
    },
];

// کاربران
const usersData = [
    { name: 'علی', lastName: 'محمدی', mobile: '09121112222', email: 'admin@toolshop.com', password: '123456', role: 'admin' },
    { name: 'رضا', lastName: 'کریمی', mobile: '09123334444', email: 'reza@toolshop.com', password: '123456', role: 'user' },
    { name: 'سعید', lastName: 'احمدی', mobile: '09125556666', email: 'saeed@toolshop.com', password: '123456', role: 'user' },
    { name: 'مریم', lastName: 'حسینی', mobile: '09127778888', email: 'maryam@toolshop.com', password: '123456', role: 'user' },
];

// آدرس‌ها
const getAddressesData = (userIds) => [
    { userId: userIds[1], fullName: 'رضا کریمی', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، پلاک ۱۲۳', postalCode: '1234567890', phone: '09123334444', isDefault: true },
    { userId: userIds[2], fullName: 'سعید احمدی', province: 'اصفهان', city: 'اصفهان', address: 'خیابان چهارباغ، کوچه سعادت', postalCode: '9876543210', phone: '09125556666', isDefault: true },
    { userId: userIds[3], fullName: 'مریم حسینی', province: 'شیراز', city: 'شیراز', address: 'بلوار کریم خان زند، پلاک ۴۵', postalCode: '5678901234', phone: '09127778888', isDefault: true },
];

// نظرات
const getReviewsData = (userIds, productIds) => [
    { userId: userIds[1], productId: productIds[0], rating: 5, title: 'عالی بود', comment: 'این آچار بکس واقعاً کیفیت عالی داره، برای کارگاهم خریدم راضیم', isVerified: true, helpful: 12 },
    { userId: userIds[2], productId: productIds[1], rating: 4, title: 'خوب اما گرون', comment: 'کیفیت خوبی داره ولی قیمتش نسبت به بازار کمی بالاست', isVerified: true, helpful: 5 },
    { userId: userIds[3], productId: productIds[2], rating: 5, title: 'انبردست فوق العاده', comment: 'خیلی محکم و با کیفیت، دستگیره خوبی داره', isVerified: true, helpful: 8 },
    { userId: userIds[1], productId: productIds[3], rating: 4.5, title: 'دریل قدرتمند', comment: 'دریل خوبیه، برای کارهای سنگین مناسبه', isVerified: true, helpful: 15 },
];

// کانتکت‌ها
const contactsData = [
    { title: 'مشکل در سفارش', firstName: 'حسن', lastName: 'رضایی', mobile: '09129998888', email: 'hassan@example.com', description: 'من چند روز پیش سفارش دادم اما هنوز به دستم نرسیده', status: 'pending' },
    { title: 'سوال فنی', firstName: 'نرگس', lastName: 'مهدوی', mobile: '09126667777', email: 'narges@example.com', description: 'در مورد نحوه استفاده از مینی فرز سوال داشتم', status: 'read' },
];

// ==================== اجرای سیدر ====================
async function seed() {
    try {
        console.log('🚀 Starting database seeding...');
        console.log('📦 Seeding tools and equipment data...\n');

        // 1. پاک کردن دیتاهای قبلی
        console.log('🗑️ Clearing existing data...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Address.deleteMany({});
        await Review.deleteMany({});
        await Order.deleteMany({});
        await Payment.deleteMany({});
        await Contact.deleteMany({});
        await Wishlist.deleteMany({});
        await Blog.deleteMany({});
        console.log('✅ All data cleared\n');

        // 2. ایجاد دسته‌بندی‌ها
        console.log('📁 Creating categories...');
        const categories = [];
        for (const cat of categoriesData) {
            const category = new Category(cat);
            await category.save();
            categories.push(category);
            console.log(`  ✅ ${cat.name}`);
        }
        console.log(`✅ ${categories.length} categories created\n`);

        // 3. ایجاد محصولات
        console.log('🔧 Creating products...');
        const categoryIds = categories.map(c => c._id);
        const productsDataWithIds = getProductsData(categoryIds);
        const products = [];

        for (const prod of productsDataWithIds) {
            const product = new Product(prod);
            await product.save();
            products.push(product);
        }
        console.log(`✅ ${products.length} products created\n`);

        // 4. ایجاد کاربران
        console.log('👥 Creating users...');
        const users = [];
        for (const user of usersData) {
            const newUser = new User(user);
            await newUser.save();
            users.push(newUser);
            console.log(`  ✅ ${user.name} ${user.lastName} (${user.role})`);
        }
        console.log(`✅ ${users.length} users created\n`);

        // 5. ایجاد آدرس‌ها
        console.log('📍 Creating addresses...');
        const userIds = users.map(u => u._id);
        const addressesDataWithIds = getAddressesData(userIds);
        for (const addr of addressesDataWithIds) {
            const address = new Address(addr);
            await address.save();
        }
        console.log(`✅ ${addressesDataWithIds.length} addresses created\n`);

        // 6. ایجاد نظرات
        console.log('⭐ Creating reviews...');
        const productIds = products.map(p => p._id);
        const reviewsDataWithIds = getReviewsData(userIds, productIds);
        for (const rev of reviewsDataWithIds) {
            const review = new Review(rev);
            await review.save();
        }
        console.log(`✅ ${reviewsDataWithIds.length} reviews created\n`);

        // 7. ایجاد مقالات بلاگ
        console.log('📝 Creating blog posts...');
        for (const blog of blogsData) {
            const newBlog = new Blog(blog);
            await newBlog.save();
            console.log(`  ✅ ${blog.title.substring(0, 40)}...`);
        }
        console.log(`✅ ${blogsData.length} blog posts created\n`);

        // 8. ایجاد پیام‌های تماس
        console.log('📧 Creating contact messages...');
        for (const contact of contactsData) {
            const newContact = new Contact(contact);
            await newContact.save();
        }
        console.log(`✅ ${contactsData.length} contact messages created\n`);

        // 9. آماده‌سازی اطلاعات نهایی
        console.log('📊 Summary:');
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Blog Posts: ${blogsData.length}`);
        console.log(`   - Contacts: ${contactsData.length}`);

        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// اجرا
seed();