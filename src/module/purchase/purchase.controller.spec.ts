import { Test, TestingModule } from "@nestjs/testing";
import { PurchaseController } from "./purchase.controller";
import { PurchaseService } from "./purchase.service";
import { Purchase } from "@prisma/client";
import { PurchaseDTO } from "./dto/purchase.dto";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "../auth/auth.guard";
import { UnauthorizedException } from "@nestjs/common";

const purchaseList: Purchase[] = [
  { id: '1', total: 20, userId: '3', purchase_date: new Date(2024, 5, 10), createdAt: null, deletedAt: null, updatedAt: null },
  { id: '2', total: 20, userId: '2', purchase_date: new Date(2024, 4, 10), createdAt: null, deletedAt: null, updatedAt: null },
  { id: '3', total: 20, userId: '1', purchase_date: new Date(2024, 2, 10), createdAt: null, deletedAt: null, updatedAt: null },
];

const deletedPurchase: Purchase = { id: '1', total: 20, userId: '3', purchase_date: new Date(2024, 5, 10), createdAt: null, deletedAt: new Date(), updatedAt: null };

describe('PurchaseController', () => {
  let purchaseController: PurchaseController;
  let purchaseService: PurchaseService;

  beforeEach(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseController],
      providers: [{
        provide: PurchaseService,
        useValue: {
          create: jest.fn().mockResolvedValue(null),
          findAll: jest.fn().mockResolvedValue(purchaseList),
          findOne: jest.fn().mockResolvedValue(purchaseList[0]),
          deletePurchase: jest.fn().mockResolvedValue(deletedPurchase),
        }
      },
      Reflector
    ]
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();

    purchaseController = module.get<PurchaseController>(PurchaseController);
    purchaseService = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(purchaseController).toBeDefined();
    expect(purchaseService).toBeDefined();
  });

  describe('create', () => {
    it('should create a purchase successfully', async () => {
      // arrange
      const body: PurchaseDTO = {
        purchaseDate: new Date(2024, 5, 10),
        userId: '3',
        products: []
      };

      const request = {
        user: {
          userId: '3',
        },
      };

      // act
      await purchaseController.create(request, body);

      // assert
      expect(purchaseService.create).toHaveBeenCalledTimes(1);
      expect(purchaseService.create).toHaveBeenCalledWith(body);
    });

    it('should throw an UnauthorizedException if userId does not match', async () => {
      // Arrange
      const body: PurchaseDTO = {
        purchaseDate: new Date(2024, 5, 10),
        userId: '3',
        products: [],
      };
      const request = {
        user: {
          userId: '4',
        },
      };

      expect(() => purchaseController.create(request, body)).toThrow(UnauthorizedException);
    });

    it('should throw an execption', () => {
      const body: PurchaseDTO = {
        purchaseDate: new Date(2024, 5, 10),
        userId: '3',
        products: []
      };
      const request = {
        user: {
          userId: '3',
        },
      };

      jest.spyOn(purchaseService, 'create').mockRejectedValueOnce(new Error());

      expect(purchaseController.create(request, body)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return a purchase list successfully', async () => {
      const result = await purchaseController.findAll();
      
      expect(result).toEqual(purchaseList);
    });

    it('should throw an exception', () => {
      jest.spyOn(purchaseService, 'findAll').mockRejectedValueOnce(new Error());

      expect(purchaseController.findAll()).rejects.toThrow();
    });
  });
  
  describe('findOne', () => {
    it('should get a purchase item successfully', async () => {
      // Act
      const result = await purchaseController.findOne('1');

      // Assert
      expect(result).toEqual(purchaseList[0]);
      expect(purchaseService.findOne).toHaveBeenCalledTimes(1);
      expect(purchaseService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(purchaseService, 'findOne').mockRejectedValueOnce(new Error());

      // Assert
      expect(purchaseController.findOne('1')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a purchase item successfully', async () => {
      // Act
      const result = await purchaseController.delete('1');

      // Assert
      expect(result).toEqual(deletedPurchase);
      expect(result.deletedAt).toBeTruthy();
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(purchaseService, 'deletePurchase').mockRejectedValueOnce(new Error());

      // Assert
      expect(purchaseController.delete('1')).rejects.toThrow();
    });
  });

});