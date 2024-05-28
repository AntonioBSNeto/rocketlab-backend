import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UserDTO } from "./dto/user.dto";
import { randomUUID } from "crypto";
import { User } from "@prisma/client";

import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from "./dto/update-user.dto";
import { AddressDto } from "./dto/address.dto";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) { }

  private async findUserById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { id }, include: { addresses: true } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if(user.deletedAt) {
      throw new BadRequestException(`User with ID ${id} is already deleted`)
    }

    return user;
  }

  private async createAddress(prisma: PrismaService, addr: AddressDto, userId: string): Promise<void> {
    const { city, country, state, street, zipCode, streetNumber } = addr;
    await prisma.address.create({
      data: {
        id: randomUUID(),
        city,
        state,
        country,
        zipCode,
        street,
        streetNumber,
        userId
      }
    })
  }

  private async updateAddress(prisma: PrismaService, addr: AddressDto, userId: string): Promise<void> {
    const { city, country, state, street, zipCode, streetNumber, id } = addr;
    await prisma.address.update({
      where: { id },
      data: {
        city,
        state,
        country,
        zipCode,
        street,
        streetNumber,
        userId
      }
    })
  }

  async create(userDTO: UserDTO): Promise<void> {
    const { name, email, password, addresses, phone } = userDTO;
    const hashedPassword = await bcrypt.hash(password, 10)

    await this.prismaService.$transaction(async (prisma) => {
      const existUser = await prisma.user.findUnique({ where: { email } })

      if(existUser) {
        throw new ConflictException("Email is already registered");
      }

      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          name,
          email,
          password: hashedPassword,
          phone,
        }
      });

      if (addresses && addresses.length > 0) {
        for (const addr of addresses) {
          this.createAddress(this.prismaService, addr, user.id);
        }
      }
    })
  }

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany({ include: { addresses: true }, where: { deletedAt: null }});
  }

  async findOne(id: string): Promise<User> {
    return await this.findUserById(id);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.prismaService.user.findUnique({ where: { email } })
  }

  async updateUser(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
    return this.prismaService.$transaction(async (prisma) => {
      await this.findUserById(id);

      const { addresses, email, name, password, phone } = updateUserDTO

      const data: { [key: string]: any } = {};
      if (updateUserDTO.email !== undefined) data.email = email;
      if (updateUserDTO.name !== undefined) data.name = name;
      if (updateUserDTO.password !== undefined) data.password = password;
      if (updateUserDTO.phone !== undefined) data.phone = phone;

      // update user adrress
      if (addresses && addresses.length > 0) {
        for (const addr of addresses) {
          if (addr.id) {
            await this.updateAddress(this.prismaService, addr, id)
          } else {
            await this.createAddress(this.prismaService, addr, id);
          }
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        include: { addresses: true }
      });
      
      return updatedUser
    })
  }

  async deleteUser(id: string): Promise<User> {
    await this.findUserById(id);

    return await this.prismaService.$transaction(async (prisma) => {
      await prisma.address.updateMany({ where: { userId: id}, data: { deletedAt: new Date() } });

      return await prisma.user.update({ where: { id }, data: { deletedAt: new Date() }, include: { addresses: true } });
    });
  }

}