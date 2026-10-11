import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OilsService } from './oils.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('oils')
export class OilsController {
  constructor(private readonly oilsService: OilsService) {}

  // POST /oils (creează ulei pentru userul curent)
  @Post()
  create(@Req() req: any, @Body() createOilDto: CreateOilDto) {
    return this.oilsService.create(req.user.userId, createOilDto);
  }

  // POST /oils/import-csv (noua rută pentru fișiere CSV)
  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.oilsService.importCsv(req.user.userId, file.buffer);
  }

  // GET /oils (doar uleiurile userului curent)
  @Get()
  findAll(@Req() req: any) {
    return this.oilsService.findAll(req.user.userId);
  }

  // GET /oils/by-name/:name (căutare după nume doar în inventarul propriu)
  @Get('by-name/:name')
  findOneByName(@Req() req: any, @Param('name') name: string) {
    return this.oilsService.findOneByName(req.user.userId, name);
  }

  // GET /oils/:id (un singur ulei după ID)
  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.oilsService.findOne(req.user.userId, id);
  }

  // PATCH /oils/:id (actualizează stocul sau datele)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateOilDto>,
  ) {
    return this.oilsService.update(req.user.userId, id, updateData);
  }

  // DELETE /oils/:id (șterge un ulei doar dacă aparține userului curent)
  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.oilsService.remove(req.user.userId, id);
  }
}