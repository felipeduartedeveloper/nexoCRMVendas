import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductToDealDto } from './dto/add-product-to-deal.dto';

@ApiTags('products')
@ApiBearerAuth()
@Controller()
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Get('products')
  list(
    @CurrentOrg() orgId: string | null,
    @Query() p: PaginationDto & { active?: string; category?: string },
  ) {
    return this.svc.list(orgId, p);
  }

  @Get('products/:id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }

  @Post('products')
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.svc.create(orgId, userId, dto);
  }

  @Patch('products/:id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch('products/:id/active')
  setActive(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { active: boolean },
  ) {
    return this.svc.setActive(id, orgId, body.active);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }

  @Post('products/deal-products')
  addToDeal(@CurrentOrg() orgId: string | null, @Body() dto: AddProductToDealDto) {
    return this.svc.addToDeal(orgId, dto);
  }

  @Delete('products/deal-products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromDeal(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.svc.removeFromDeal(id, orgId);
  }

  @Get('deals/:dealId/products')
  listOfDeal(
    @CurrentOrg() orgId: string | null,
    @Param('dealId', ParseUUIDPipe) dealId: string,
  ) {
    return this.svc.listProductsOfDeal(dealId, orgId);
  }
}
