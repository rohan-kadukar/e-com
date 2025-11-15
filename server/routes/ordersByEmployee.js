// routes/ordersByEmployee.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST /api/orders/by-employee
// body: { email: string }
router.post("/by-employee", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!email) {
      return res.status(400).json({ error: "email is required in request body" });
    }

    // Fetch orders for this email (employee)
    const orders = await prisma.customer_order.findMany({
      where: { email },
      orderBy: { dateTime: "desc" },
      select: {
        id: true,
        name: true,
        lastname: true,
        phone: true,
        email: true,
        company: true,
        adress: true,
        apartment: true,
        postalCode: true,
        dateTime: true,
        status: true,
        total: true,
      },
    });

    if (orders.length === 0) {
      return res.json({ orders: [] });
    }

    // For each order, fetch its line items and attach product details
    const responseOrders = [];
    for (const o of orders) {
      const lines = await prisma.customer_order_product.findMany({
        where: { customerOrderId: o.id },
        include: { product: { select: { id: true, title: true, mainImage: true, price: true, slug: true } } },
      });

      responseOrders.push({
        customerOrderId: o.id,
        customerOrder: {
          name: o.name,
          lastname: o.lastname,
          phone: o.phone,
          email: o.email,
          company: o.company,
          adress: o.adress,
          apartment: o.apartment,
          postalCode: o.postalCode,
          dateTime: o.dateTime,
          status: o.status,
          total: o.total,
        },
        products: lines.map((l) => ({
          id: l.product.id,
          title: l.product.title,
          mainImage: l.product.mainImage,
          price: l.product.price,
          slug: l.product.slug,
          quantity: l.quantity,
        })),
      });
    }

    return res.json({ orders: responseOrders });
  } catch (e) {
    console.error("by-employee error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
