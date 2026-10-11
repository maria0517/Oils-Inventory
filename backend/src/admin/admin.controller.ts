import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin-guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/reset-password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPass') newPass: string,
  ) {
    return this.adminService.resetPassword(id, newPass);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Get('users/:id/oils')
  getUserOils(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserOils(id);
  }

  @Patch('oils/:id')
  updateOilStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { smallBottles?: number; largeBottles?: number },
  ) {
    return this.adminService.updateOilStock(id, body);
  }
}