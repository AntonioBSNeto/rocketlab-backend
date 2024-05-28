import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ProductService } from "./products.service";
import { ProductDTO } from "./dto/product.dto";
import { Product } from "@prisma/client";
import { UpdateProductDTO } from "./dto/update-product.dto";

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  create(@Body() body: ProductDTO) {
    return this.productService.create(body);
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get('search')
  async getProdutosByName(@Query('name') nome: string) {
    return this.productService.findAllByNameContaining(nome);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDTO: UpdateProductDTO) {
    return this.productService.updateProduct(id, updateProductDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

}
