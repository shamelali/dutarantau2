import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { marketplaceSellers, products } from "@/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

interface ProductItem {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
  sellerName: string;
  verificationStatus: string;
}

interface SellerItem {
  id: number;
  storeName: string;
  description: string;
  rating: number;
  verificationStatus: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const sellerId = searchParams.get("sellerId");

    let productQuery = db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      description: products.description,
      images: products.images,
      sellerId: products.sellerId,
      verificationStatus: products.verificationStatus,
    })
      .from(products);

    let sellerQuery = db.select({
      id: marketplaceSellers.id,
      storeName: marketplaceSellers.storeName,
      description: marketplaceSellers.description,
      rating: marketplaceSellers.rating,
      verificationStatus: marketplaceSellers.verificationStatus,
    })
      .from(marketplaceSellers);

    const conditions = [];

    if (query) {
      productQuery = productQuery.where(
        ilike(products.name, `%${query}%`)
          .or(ilike(products.description, `%${query}%`)))
      sellerQuery = sellerQuery.where(
        ilike(marketplaceSellers.storeName, `%${query}%`))
    }
    if (category) {
      productQuery = productQuery.where(eq(products.category, category))
    }
    if (sellerId) {
      productQuery = productQuery.where(eq(products.sellerId, Number(sellerId)))
      sellerQuery = sellerQuery.where(eq(marketplaceSellers.id, Number(sellerId)))
    }

    productQuery = productQuery.orderBy(desc(products.createdAt));
    sellerQuery = sellerQuery.orderBy(desc(marketplaceSellers.createdAt));

    const [productsResult, sellersResult] = await Promise.all([
      productQuery.limit(20),
      sellerQuery.limit(10),
    ]);

    const products: ProductItem[] = productsResult.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.images?.[0] || "/placeholder-product.svg",
      sellerName: "", // Will be filled below
      verificationStatus: p.verificationStatus,
    })) as ProductItem[];

    const sellers: SellerItem[] = sellersResult.map((s) => ({
      id: s.id,
      storeName: s.storeName,
      description: s.description,
      rating: s.rating,
      verificationStatus: s.verificationStatus,
    })) as SellerItem[];

    // Attach seller names to products (simple mapping)
    // In a full implementation, this would use the sellerId relationship

    return NextResponse.json({ products, sellers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();

    const { name, description, price, category, images, sellerId } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: "Mohon lengkapi nama produk, deskripsi, harga, dan kategori" }, { status: 400 });
    }

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description,
        price,
        category,
        images: images || [],
        sellerId: currentUserId,
        verificationStatus: "new_seller",
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("duta_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const currentUserId = JSON.parse(sessionCookie.value).id;
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "ID produk wajib diisi" }, { status: 400 });
    }

    // Check if user owns this product
    const product = await db.select().from(products).where(
      eq(products.id, Number(productId))
    ).limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (product[0].sellerId !== currentUserId) {
      return NextResponse.json({ error: "Tidak berwenang menghapus produk ini" }, { status: 403 });
    }

    await db.delete(products).where(eq(products.id, Number(productId)));

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}