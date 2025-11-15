// controllers/wishlist.js
// Matches your routes and DB (only id, productId, userId fields). No schema changes.
// Product/user details should be fetched via your existing controllers when needed.

const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

/**
 * GET /api/wishlist
 * Return all wishlist rows (admin/debug)
 */
const getAllWishlist = asyncHandler(async (request, response) => {
  const rows = await prisma.wishlist.findMany({
    select: { id: true, productId: true, userId: true },
    orderBy: { id: "desc" },
  });
  return response.status(200).json(rows);
});

/**
 * GET /api/wishlist/:userId
 * Return all wishlist rows for a user
 */
const getAllWishlistByUserId = asyncHandler(async (request, response) => {
  const { userId } = request.params;
  if (!userId) throw new AppError("userId is required", 400);

  const items = await prisma.wishlist.findMany({
    where: { userId },
    select: { id: true, productId: true, userId: true },
    orderBy: { id: "desc" },
  });

  return response.status(200).json(items);
});

/**
 * GET /api/wishlist/:userId/:productId
 * Get single wishlist row (check if a product is in user's wishlist)
 */
const getSingleProductFromWishlist = asyncHandler(async (request, response) => {
  const { userId, productId } = request.params;
  if (!userId) throw new AppError("userId is required", 400);
  if (!productId) throw new AppError("productId is required", 400);

  // Prefer composite unique if exists; fallback to findFirst
  let row = null;
  try {
    row = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true, productId: true, userId: true },
    });
  } catch {
    row = await prisma.wishlist.findFirst({
      where: { userId, productId },
      select: { id: true, productId: true, userId: true },
    });
  }

  if (!row) return response.status(404).json({ message: "Not in wishlist" });
  return response.status(200).json(row);
});

/**
 * POST /api/wishlist
 * Body: { userId, productId }
 * Create wishlist row (id, productId, userId only)
 */
const createWishItem = asyncHandler(async (request, response) => {
  let { userId, productId } = request.body;

  if (!userId || !productId) throw new AppError("userId and productId are required", 400);
  if (typeof userId !== "string" || typeof productId !== "string") {
    throw new AppError("Invalid ids", 400);
  }

  const existing = await prisma.wishlist.findFirst({
    where: { userId, productId },
    select: { id: true, productId: true, userId: true },
  });
  if (existing) return response.status(200).json({ message: "Already in wishlist", item: existing });

  const item = await prisma.wishlist.create({
    data: { userId, productId },
    select: { id: true, productId: true, userId: true },
  });
  return response.status(201).json({ message: "Added to wishlist", item });
});


const deleteWishItem = asyncHandler(async (request, response) => {
  let { userId, productId } = request.params;

  if (!userId || !productId) throw new AppError("userId and productId are required", 400);
  if (typeof userId !== "string" || typeof productId !== "string") {
    throw new AppError("Invalid ids", 400);
  }

  const existing = await prisma.wishlist.findFirst({ where: { userId, productId }, select: { id: true } });
  if (!existing) throw new AppError("Not found in wishlist", 404);

  await prisma.wishlist.delete({ where: { id: existing.id } });
  return response.status(200).json({ message: "Removed from wishlist" });
});

module.exports = {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist,
};
