import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserService } from "./users.service";
import { UserDTO } from "./dto/user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";


@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: UserDTO) {
    try {
      return this.userService.create(body);
    } catch(error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return this.userService.updateUser(id, updateUserDTO);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
  
}
