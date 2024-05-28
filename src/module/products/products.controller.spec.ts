import { Test, TestingModule } from "@nestjs/testing";
import { ProductController } from "./products.controller";
import { ProductService } from "./products.service";
import { Product } from "@prisma/client";
import { ProductDTO } from "./dto/product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";

const productList: Product[] = [
  {id: '1', name: 'produtos 1', price: 1, quantity: 1, description: 'descricao 1', createdAt: null, deletedAt: null, updatedAt: null},
  {id: '2', name: 'produtos 2', price: 2, quantity: 2, description: 'descricao 2', createdAt: null, deletedAt: null, updatedAt: null},
  {id: '3', name: 'produto 3', price: 3, quantity: 3, description: 'descricao 3', createdAt: null, deletedAt: null, updatedAt: null},
]

const updatedProduct: Product =  {id: '2', name: 'novo produto', price: 2, quantity: 20, description: 'descricao 2', createdAt: null, deletedAt: null, updatedAt: null}

const deletedProduct: Product = {id: '3', name: 'produto 3', price: 3, quantity: 3, description: 'descricao 3', createdAt: null, deletedAt: new Date(2024, 5, 1), updatedAt: null}

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{
        provide: ProductService,
        useValue: {
          create: jest.fn().mockResolvedValue(null),
          findAll: jest.fn().mockResolvedValue(productList),
          findAllByNameContaining: jest.fn().mockResolvedValue(productList.slice(0,2)),
          findOne: jest.fn().mockResolvedValue(productList[0]),
          updateProduct: jest.fn().mockResolvedValue(updatedProduct),
          deleteProduct: jest.fn().mockResolvedValue(deletedProduct),
        }
      }]
    }).compile();


    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
    expect(productService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a product list successfully', async () => {
      const result = await productController.findAll();
      
      expect(result).toEqual(productList);
    });

    it('should throw an exception', () => {
      jest.spyOn(productService, 'findAll').mockRejectedValueOnce(new Error());

      expect(productController.findAll()).rejects.toThrow();
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
      await productController.create(body);

      // assert
      expect(productService.create).toHaveBeenCalledTimes(1);
      expect(productService.create).toHaveBeenCalledWith(body);
    })

    it('should throw an execption', () => {
      const body: ProductDTO = {
        description: 'descricao produto 1',
        name: 'produto 1',
        price: 100.00,
        quantity: 1,
      };

      jest.spyOn(productService, 'create').mockRejectedValueOnce(new Error());

      expect(productController.create(body)).rejects.toThrow();
    });
  });

  describe('getProdutosByName', () => {
    it('should return a list of products whose name contains a given string successfully', async () => {
      const term = 'produtos';

      const result = await productController.getProdutosByName(term);

      expect(result).toEqual(productList.slice(0,2));
      expect(productService.findAllByNameContaining).toHaveBeenCalledTimes(1);
      expect(productService.findAllByNameContaining).toHaveBeenCalledWith(term);
    });

    it('should throw an execption', () => {
      const term = 'produtos';

      jest.spyOn(productService, 'findAllByNameContaining').mockRejectedValueOnce(new Error());

      expect(productController.getProdutosByName(term)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should get a product item successfully', async () => {
      // Act
      const result = await productController.findOne('1');

      // Assert
      expect(result).toEqual(productList[0]);
      expect(productService.findOne).toHaveBeenCalledTimes(1);
      expect(productService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(productService, 'findOne')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(productController.findOne('1')).rejects.toThrow();
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
      const result = await productController.update('2', body);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(productService.updateProduct).toHaveBeenCalledTimes(1);
      expect(productService.updateProduct).toHaveBeenCalledWith('2', body);
    });

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateProductDTO = {
        name: 'Novo nome',
        quantity: 20,
      };

      jest.spyOn(productService, 'updateProduct').mockRejectedValueOnce(new Error());

      // Assert
      expect(productController.update('2', body)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a produuct item successfully', async () => {
      // Act
      const result = await productController.delete('1');

      // Assert
      expect(result).toEqual(deletedProduct);
      expect(result.deletedAt).toEqual(deletedProduct.deletedAt);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(productService, 'deleteProduct').mockRejectedValueOnce(new Error());

      // Assert
      expect(productController.delete('1')).rejects.toThrow();
    });
  });

})