import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
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

    // Customers = unique phone numbers that ordered (guest checkout)
    const totalCustomers = (await Order.distinct('shippingAddress.phone')).length;

    // Recent Orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Top Selling Products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .lean();

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
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
        revenueByMonth: formattedRevenueByMonth,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/stats failed', error);
    return NextResponse.json(
      { success: false, error: 'Database unavailable. Check MONGODB_URI and Atlas Network Access.' },
      { status: 503 }
    );
  }
}
