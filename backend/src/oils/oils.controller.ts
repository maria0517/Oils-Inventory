import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { OilsService } from './oils.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { UpdateOilDto } from './dto/update-oil.dto';

@Controller('oils')
export class OilsController {
  constructor(private readonly oilsService: OilsService) {}

  // POST /oils 
  @Post()
  create(@Body() createOilDto: CreateOilDto) {
    return this.oilsService.create(createOilDto);
  }

  // GET /oils
  @Get()
  findAll() {
    return this.oilsService.findAll();
  }

  // GET /oils/:name 
  @Get(':name')
  findOneByName(@Param('name') name: string) {
    return this.oilsService.findOneByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.oilsService.findOne(id);
  }

  // PATCH /oils/:id 
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateOilDto>,
  ) {
    return this.oilsService.update(id, updateData);
  }

  // DELETE /oils/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.oilsService.remove(id);
  }
}