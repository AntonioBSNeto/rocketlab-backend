import { Test, TestingModule } from "@nestjs/testing";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";
import { Product } from "@prisma/client";
import { ProductDTO } from "./dto/product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";
import { PrismaService } from "../../database/prisma.service";
import { randomUUID } from "crypto";

const productList: Product[] = [
  { id: '1', name: 'produtos 1', price: 1, quantity: 1, description: 'descricao 1', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '2', name: 'produtos 2', price: 2, quantity: 2, description: 'descricao 2', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '3', name: 'produto 3', price: 3, quantity: 3, description: 'descricao 3', createdAt: null, deletedAt: null, updatedAt: null },
]

const updatedProduct: Product = { id: '2', name: 'novo produto', price: 2, quantity: 20, description: 'descricao 2', createdAt: null, deletedAt: null, updatedAt: null }

const deletedProduct: Product = { id: '3', name: 'produto 3', price: 3, quantity: 3, description: 'descricao 3', createdAt: null, deletedAt: new Date(2024, 5, 1), updatedAt: null }

describe('ProductService', () => {
  let productService: ProductService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductService],
      providers: [{
        provide: PrismaService,
        useValue: {
          product: {
            findMany: jest.fn().mockImplementation((args) => {
              if (args?.where?.name?.contains) {
                return productList.filter(product => product.name.includes(args.where.name.contains));
              } else {
                return productList;
              }
            }),
            create: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(productList[0]),
            update: jest.fn().mockResolvedValue(updatedProduct),
            delete: jest.fn().mockResolvedValue(deletedProduct),
          }
        }
      }]
    }).compile();

    productService = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
    expect(productService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a product list successfully', async () => {
      const result = await productService.findAll();

      expect(result).toEqual(productList);
    });

    it('should throw an exception', () => {
      jest.spyOn(prismaService.product, 'findMany').mockRejectedValueOnce(new Error());

      expect(productService.findAll()).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      // arrange
      const body: ProductDTO = {
        description: 'descricao produto 1',
        name: 'produto 1',
        price: 100.00,
        quantity: 1,
      };

      // act
      await productService.create(body);

      // assert
      expect(prismaService.product.create).toHaveBeenCalledTimes(1);
    })

    it('should throw an execption', () => {
      const body: ProductDTO = {
        description: 'descricao produto 1',
        name: 'produto 1',
        price: 100.00,
        quantity: 1,
      };

      jest.spyOn(prismaService.product, 'create').mockRejectedValueOnce(new Error());

      expect(productService.create(body)).rejects.toThrow();
    });
  });

  describe('findAllByNameContaining', () => {
    it('should return a list of products whose name contains a given string successfully', async () => {
      const term = 'produtos';

      const result = await productService.findAllByNameContaining(term);

      expect(result).toEqual(productList.slice(0, 2));
      expect(prismaService.product.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({ where: { name: { contains: term } } });
    });

    it('should throw an execption', () => {
      const term = 'produtos';

      jest.spyOn(prismaService.product, 'findMany').mockRejectedValueOnce(new Error());

      expect(productService.findAllByNameContaining(term)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should get a product item successfully', async () => {
      // Act
      const result = await productService.findOne('1');

      // Assert
      expect(result).toEqual(productList[0]);
      expect(prismaService.product.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(prismaService.product, 'findUnique')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(productService.findOne('1')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a product item successfully', async () => {
      // Arrange
      const body: UpdateProductDTO = {
        name: 'Novo nome',
        quantity: 20,
      };

      // Act
      const result = await productService.updateProduct('2', body);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(prismaService.product.update).toHaveBeenCalledTimes(1);
      expect(prismaService.product.update).toHaveBeenCalledWith({ where: { id: '2' }, data: body });
    });

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateProductDTO = {
        name: 'Novo nome',
        quantity: 20,
      };

      jest.spyOn(prismaService.product, 'update').mockRejectedValueOnce(new Error());

      // Assert
      expect(productService.updateProduct('2', body)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a produuct item successfully', async () => {
      // Act
      const result = await productService.deleteProduct('1');

      // Assert
      expect(result).toEqual(deletedProduct);
      expect(result.deletedAt).toEqual(deletedProduct.deletedAt);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(prismaService.product, 'delete').mockRejectedValueOnce(new Error());

      // Assert
      expect(productService.deleteProduct('1')).rejects.toThrow();
    });
  });

})