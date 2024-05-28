import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ProductDTO } from "./dto/product.dto";
import { randomUUID } from "crypto";
import { Product } from "@prisma/client";
import { UpdateProductDTO } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) { }

  private async findProductById(id: string): Promise<Product> {
    const product = await this.prismaService.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(productDTO: ProductDTO): Promise<void> {
    const { name, description, price, quantity } = productDTO;
    await this.prismaService.product.create({
      data: {
        id: randomUUID(),
        name,
        description,
        price,
        quantity,
      }
    });
  }

  async findAll(): Promise<Product[]> {
    return await this.prismaService.product.findMany();
  }

  async findOne(id: string): Promise<Product> {
    return await this.findProductById(id);
  }

  async updateProduct(id: string, updateProductDTO: UpdateProductDTO): Promise<Product> {
    await this.findProductById(id);
    return this.prismaService.product.update({
      where: { id },
      data: updateProductDTO
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    await this.findProductById(id);
    return this.prismaService.product.delete({ where: { id } });
  }

  async findAllByNameContaining(name: string): Promise<Product[]> {
    return await this.prismaService.product.findMany({
      where: {
        name: {
          contains: name,
        },
      }
    })
  }

}