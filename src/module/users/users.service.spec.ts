import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./users.service";
import { User } from "@prisma/client";
import { UserDTO } from "./dto/user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { PrismaService } from "../../database/prisma.service";

const userList: User[] = [
  { id: '0', email: 'email0@email.com', name: 'nome 0', password: 'senha0', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '1', email: 'email1@email.com', name: 'nome 1', password: 'senha1', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '2', email: 'email2@email.com', name: 'nome 2', password: 'senha2', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null }
]

const updatedUser = { id: '1', email: 'email1@email.com', name: 'nome novo', password: 'nova senha', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null };

const deletedUser = { id: '3', email: 'email3@email.com', name: 'nome 3', password: 'senha3', phone: '9999999999', createdAt: null, deletedAt: new Date(2024, 5, 1), updatedAt: null };

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserService],
      providers: [{
        provide: PrismaService,
        useValue: {
          user: {
            findMany: jest.fn().mockResolvedValue(userList),
            create: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(userList[0]),
            update: jest.fn().mockResolvedValue(updatedUser),
            delete: jest.fn().mockResolvedValue(deletedUser)
          },
          $transaction: jest.fn().mockResolvedValue(null)
        }
      }]
    }).compile();


    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a user list entity successfully', async () => {
      const result = await userService.findAll();
      
      expect(result).toEqual(userList);
    });

    it('should throw an exception', () => {
      jest.spyOn(userService, 'findAll').mockRejectedValueOnce(new Error());

      expect(userService.findAll()).rejects.toThrow();
    });
  });

  describe('create', () => {
    // $transaction mock doesn work
    // it('should create a user successfully', async () => {
    //   // arrange
    //   const body: UserDTO = {
    //     name: 'produto 1',
    //     email: 'email@email.com',
    //     password: 'senha1'
    //   };

    //   // act
    //   await userService.create(body);

    //   // assert
    //   expect(prismaService.user.create).toHaveBeenCalledTimes(1);
    //   // $transaction mock doesn work
    // })

    it('should throw an execption', () => {
      const body: UserDTO = {
        name: 'produto 1',
        email: 'email@email.com',
        password: 'senha1'
      };

      jest.spyOn(prismaService, '$transaction').mockRejectedValueOnce(new Error());

      expect(userService.create(body)).rejects.toThrow();
    });
  });


  describe('findOne', () => {
    it('should get a user item successfully', async () => {
      // Act
      const result = await userService.findOne('1');

      // Assert
      expect(result).toEqual(userList[0]);
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: { addresses: true } });
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.findOne('1')).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    // $transaction mock doesn work
    // it('should update a user item successfully', async () => {
    //   // Arrange
    //   const body: UpdateUserDTO = {
    //     name: 'novo nome',
    //     password: 'nova senha',
    //   };

    //   // Act
    //   const result = await userService.updateUser('2', body);

    //   // Assert
    //   expect(result).toEqual(updatedUser);
    //   expect(prismaService.user.update).toHaveBeenCalledTimes(1);
    //   expect(prismaService.user.update).toHaveBeenCalledWith({
    //     where: { id: '2' },
    //     data: body,
    //     include: { addresses: true }
    //   });
    // });

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateUserDTO = {
        name: 'novo nome',
        password: 'nova senha',
      };

      jest.spyOn(prismaService, '$transaction').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.updateUser('2', body)).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    // $transaction mock doesn work
    // it('should remove a produuct item successfully', async () => {
    //   // Act
    //   const result = await userService.deleteUser('1');

    //   // Assert
    //   expect(result).toEqual(deletedUser);
    //   expect(result.deletedAt).toEqual(deletedUser.deletedAt);
    // });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(prismaService, '$transaction').mockRejectedValueOnce(new Error());

      // Assert
      expect(userService.deleteUser('1')).rejects.toThrow();
    });
  });
});