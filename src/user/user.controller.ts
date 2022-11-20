import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('current')
  getCurrentUser(@GetUser('') user: User) {
    return user;
  }

  @Patch('current')
  editCurrentUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editCurrentUser(userId, dto);
  }
}
