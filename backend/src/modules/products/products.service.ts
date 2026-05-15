import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { DealProduct } from './entities/deal-product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductToDealDto } from './dto/add-product-to-deal.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(ProductPrice) private readonly priceRepo: Repository<ProductPrice>,
    @InjectRepository(DealProduct) private readonly dealProductRepo: Repository<DealProduct>,
    private readonly ds: DataSource,
  ) {}

  async list(
    orgId: string | null,
    p: PaginationDto & { active?: string; category?: string },
  ): Promise<PaginatedResult<Product>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.prices', 'pr')
      .orderBy('p.createdAt', 'DESC');
    if (orgId) qb.where('p.organizationId = :orgId', { orgId });
    if (p.search) {
      qb.andWhere(
        '(LOWER(p.name) LIKE :s OR LOWER(p.code) LIKE :s)',
        { s: `%${p.search.toLowerCase()}%` },
      );
    }
    if (p.category) qb.andWhere('p.category = :category', { category: p.category });
    if (p.active === 'true' || p.active === 'false') {
      qb.andWhere('p.active = :active', { active: p.active === 'true' });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string, orgId: string | null): Promise<Product> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const p = await this.repo.findOne({ where, relations: ['prices'] });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async create(
    orgId: string | null,
    ownerUserId: string,
    dto: CreateProductDto,
  ): Promise<Product> {
    if (!orgId) throw new BadRequestException('Organization is required');
    return this.ds.transaction(async (em) => {
      const product = em.create(Product, {
        name: dto.name,
        code: dto.code ?? null,
        description: dto.description ?? null,
        unit: dto.unit ?? null,
        category: dto.category ?? null,
        tax: dto.tax ?? 0,
        billingFrequency: dto.billingFrequency ?? 'ONE_TIME',
        billingCycles: dto.billingCycles ?? null,
        active: dto.active ?? true,
        visibleTo: dto.visibleTo ?? 'ENTIRE_COMPANY',
        organizationId: orgId,
        ownerUserId: dto.ownerUserId ?? ownerUserId,
      });
      const saved = await em.save(Product, product);
      if (dto.prices?.length) {
        const prices = dto.prices.map((pr) =>
          em.create(ProductPrice, {
            productId: saved.id,
            currency: pr.currency.toUpperCase(),
            price: pr.price,
            costPrice: pr.costPrice ?? null,
          }),
        );
        saved.prices = await em.save(ProductPrice, prices);
      } else {
        saved.prices = [];
      }
      return saved;
    });
  }

  async update(id: string, orgId: string | null, dto: UpdateProductDto): Promise<Product> {
    return this.ds.transaction(async (em) => {
      const product = await em.findOne(Product, {
        where: orgId ? { id, organizationId: orgId } : { id },
        relations: ['prices'],
      });
      if (!product) throw new NotFoundException('Product not found');
      const { prices, ...rest } = dto;
      Object.assign(product, rest);
      const saved = await em.save(Product, product);
      if (prices) {
        await em.delete(ProductPrice, { productId: id });
        const newPrices = prices.map((pr) =>
          em.create(ProductPrice, {
            productId: id,
            currency: pr.currency.toUpperCase(),
            price: pr.price,
            costPrice: pr.costPrice ?? null,
          }),
        );
        saved.prices = await em.save(ProductPrice, newPrices);
      }
      return saved;
    });
  }

  async setActive(id: string, orgId: string | null, active: boolean): Promise<Product> {
    const p = await this.findById(id, orgId);
    p.active = active;
    return this.repo.save(p);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const p = await this.findById(id, orgId);
    const linked = await this.dealProductRepo.count({
      where: { productId: id, organizationId: orgId ?? undefined },
    });
    if (linked > 0) {
      throw new ConflictException(
        `Não é possível apagar: produto vinculado a ${linked} negócio(s). Desative em vez de apagar.`,
      );
    }
    await this.repo.remove(p);
  }

  async addToDeal(orgId: string | null, dto: AddProductToDealDto): Promise<DealProduct> {
    if (!orgId) throw new BadRequestException('Organization is required');
    await this.findById(dto.productId, orgId);
    const dp = this.dealProductRepo.create({
      organizationId: orgId,
      dealId: dto.dealId,
      productId: dto.productId,
      quantity: dto.quantity ?? 1,
      itemPrice: dto.itemPrice,
      currency: (dto.currency ?? 'BRL').toUpperCase(),
      discount: dto.discount ?? 0,
      discountType: dto.discountType ?? 'PERCENTAGE',
      tax: dto.tax ?? 0,
      enabledFlag: true,
    });
    return this.dealProductRepo.save(dp);
  }

  async removeFromDeal(id: string, orgId: string | null): Promise<void> {
    const dp = await this.dealProductRepo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!dp) throw new NotFoundException('Deal product not found');
    await this.dealProductRepo.remove(dp);
  }

  async listProductsOfDeal(dealId: string, orgId: string | null) {
    const where: any = { dealId };
    if (orgId) where.organizationId = orgId;
    const items = await this.dealProductRepo.find({ where });
    const productIds = items.map((i) => i.productId);
    const products = productIds.length
      ? await this.repo.find({
          where: productIds.map((id) => ({ id, organizationId: orgId ?? undefined })) as any,
        })
      : [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return items.map((dp) => {
      const base = Number(dp.itemPrice) * dp.quantity;
      const discountAmt =
        dp.discountType === 'PERCENTAGE'
          ? base * (Number(dp.discount) / 100)
          : Number(dp.discount);
      const subtotal = base - discountAmt;
      const total = subtotal * (1 + Number(dp.tax) / 100);
      return {
        ...dp,
        product: byId.get(dp.productId) ?? null,
        subtotal,
        total,
      };
    });
  }
}
