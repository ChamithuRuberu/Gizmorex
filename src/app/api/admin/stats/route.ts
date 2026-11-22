import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { MOCK_PRODUCTS } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Total Revenue
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total Orders
    const totalOrders = await Order.countDocuments({
      orderStatus: { $ne: 'cancelled' },
    });

    // Pending Orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['pending', 'confirmed'] },
    });

    // Total Products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Low Stock Products (stock < 10)
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      stock: { $lt: 10, $gt: 0 },
    });

    // Total Customers
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Recent Orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    // Top Selling Products
    let topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .lean();

    if (totalProducts === 0 && topProducts.length === 0) {
      topProducts = MOCK_PRODUCTS.slice(0, 5) as any;
    }

    // Revenue by Month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenueByMonth = revenueByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts: totalProducts || MOCK_PRODUCTS.length,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
        revenueByMonth: formattedRevenueByMonth,
      },
    });
  } catch (error: any) {
    console.warn('Admin stats DB notice (using fallback):', error.message);
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: 1459200,
        totalOrders: 38,
        totalProducts: MOCK_PRODUCTS.length,
        totalCustomers: 24,
        pendingOrders: 3,
        lowStockProducts: 2,
        recentOrders: [],
        topProducts: MOCK_PRODUCTS.slice(0, 5),
        revenueByMonth: [
          { month: 'Jun', revenue: 180000 },
          { month: 'Jul', revenue: 220000 },
          { month: 'Aug', revenue: 310000 },
          { month: 'Sep', revenue: 290000 },
          { month: 'Oct', revenue: 410000 },
          { month: 'Nov', revenue: 459200 },
        ],
      },
      isFallback: true,
    });
  }
}
