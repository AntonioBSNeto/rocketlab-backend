import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Purchase } from "@prisma/client";
import { PurchaseDTO } from "./dto/purchase.dto";
import { randomUUID } from "crypto";
import { PurchaseProductDTO } from "./dto/purchaseProduct.dto";

@Injectable()
export class PurchaseService {
  constructor(private prismaService: PrismaService) { }

  private async findById(id: string): Promise<Purchase> {
    const purchase = await this.prismaService.purchase.findUnique({ where: { id }, })
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    if (purchase.deletedAt) {
      throw new BadRequestException(`Purchase with ID ${id} was deleted`)
    }

    return purchase;
  }

  private async calculatePurchaseTotalValue(productPurchases: PurchaseProductDTO[]): Promise<number> {
    const productIds = productPurchases.map(p => p.productId);
    const products = await this.prismaService.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true }
    })

    return productPurchases.reduce((total, productPurchase) => {
      const product = products.find(p => p.id === productPurchase.productId);
      return product ? total + productPurchase.quantity * product.price : total;
    }, 0);
  }

  async create(purchase: PurchaseDTO): Promise<void> {
    const { userId, products: purchaseProductsDTO, purchaseDate } = purchase

    await this.prismaService.$transaction(async (prisma) => {

      const purchaseTotal = await this.calculatePurchaseTotalValue(purchaseProductsDTO);

      await prisma.purchase.create({
        data: {
          id: randomUUID(),
          userId,
          purchase_date: purchaseDate,
          total: purchaseTotal,
          products: {
            create: purchaseProductsDTO.map(p => ({
              id: randomUUID(),
              productId: p.productId,
              quantity: p.quantity
            }))
          }
        }
      })
    })
  }

  async findAll(): Promise<Purchase[]> {
    return await this.prismaService.purchase.findMany({ where: { deletedAt: null  }, include: { products: true }});
  }

  async findOne(id: string): Promise<Purchase> {
    return await this.findById(id);
  }

  async deletePurchase(id: string): Promise<Purchase> {
    await this.findById(id);

    return await this.prismaService.$transaction(async (prisma) => {
      await prisma.productPurchase.updateMany({ where: { purchaseId: id}, data: { deletedAt: new Date() } });

      return await prisma.purchase.update({ where: { id }, data: { deletedAt: new Date() }, include: { products: true } });
    });
  }

}