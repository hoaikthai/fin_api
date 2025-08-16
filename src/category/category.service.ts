import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../common/enums';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: [{ userId }, { isDefault: true }],
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findAllByType(
    userId: string,
    type: TransactionType,
  ): Promise<Category[]> {
    return this.categoryRepository.find({
      where: [
        { userId, type },
        { isDefault: true, type },
      ],
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.isDefault && category.userId !== userId) {
      throw new ForbiddenException('Access denied to this category');
    }

    return category;
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;

    if (parentId) {
      const parent = await this.findOne(parentId, userId);
      if (parent.parentId) {
        throw new BadRequestException(
          'Cannot create category under a child category',
        );
      }
      if (parent.type !== categoryData.type) {
        throw new BadRequestException('Category type must match parent type');
      }
    }

    const category = this.categoryRepository.create({
      ...categoryData,
      parentId,
      userId,
      isDefault: false,
    });

    return this.categoryRepository.save(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('Cannot update default categories');
    }

    const { parentId, ...categoryData } = updateCategoryDto;

    if (parentId && parentId !== category.parentId) {
      const parent = await this.findOne(parentId, userId);
      if (parent.parentId) {
        throw new BadRequestException(
          'Cannot create category under a child category',
        );
      }
      if (categoryData.type && parent.type !== categoryData.type) {
        throw new BadRequestException('Category type must match parent type');
      }
    }

    Object.assign(category, categoryData);
    if (parentId !== undefined) {
      category.parentId = parentId;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);

    if (category.isDefault) {
      throw new ForbiddenException('Cannot delete default categories');
    }

    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category that has child categories',
      );
    }

    const transactionCount = await this.categoryRepository.count({
      where: { id },
      relations: ['transactions'],
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        'Cannot delete category that has associated transactions',
      );
    }

    await this.categoryRepository.softRemove(category);
  }

  async seedDefaultCategories(): Promise<void> {
    const existingDefaults = await this.categoryRepository.find({
      where: { isDefault: true },
    });

    if (existingDefaults.length > 0) {
      return;
    }

    const defaultCategories = this.getDefaultCategories();

    for (const categoryData of defaultCategories) {
      const category = this.categoryRepository.create(categoryData);
      await this.categoryRepository.save(category);
    }

    const parentCategories = await this.categoryRepository.find({
      where: { isDefault: true, parentId: IsNull() },
    });

    const childCategories = this.getDefaultChildCategories();

    for (const childData of childCategories) {
      const parent = parentCategories.find(
        (p) => p.name === childData.parentName,
      );
      if (parent) {
        const child = this.categoryRepository.create({
          name: childData.name,
          type: parent.type,
          isDefault: true,
          parentId: parent.id,
          userId: null,
        });
        await this.categoryRepository.save(child);
      }
    }
  }

  private getDefaultCategories(): Partial<Category>[] {
    return [
      {
        name: 'Food & Beverage',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Bills & Utilities',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Transportation',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Shopping',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Family',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Health & Fitness',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Education',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Entertainment',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Gift & Donation',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Insurances',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Other expense',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Outgoing transfer',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Travel',
        type: TransactionType.EXPENSE,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Salary',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Incoming transfer',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Collect interest',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Gifts',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Award',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
      {
        name: 'Selling',
        type: TransactionType.INCOME,
        isDefault: true,
        userId: null,
      },
    ];
  }

  private getDefaultChildCategories(): { name: string; parentName: string }[] {
    return [
      { name: 'Café', parentName: 'Food & Beverage' },
      { name: 'Restaurant', parentName: 'Food & Beverage' },
      { name: 'Bread and Noodles', parentName: 'Food & Beverage' },
      { name: 'Phone bill', parentName: 'Bills & Utilities' },
      { name: 'Television Bill', parentName: 'Bills & Utilities' },
      { name: 'Internet Bill', parentName: 'Bills & Utilities' },
      { name: 'Piggy bank', parentName: 'Bills & Utilities' },
      { name: 'Vehicle maintenance', parentName: 'Transportation' },
      { name: 'Parking fees', parentName: 'Transportation' },
      { name: 'Petrol', parentName: 'Transportation' },
      { name: 'Taxi', parentName: 'Transportation' },
      { name: 'Electronic devices', parentName: 'Shopping' },
      { name: 'Makeup', parentName: 'Shopping' },
      { name: 'Clothing', parentName: 'Shopping' },
      { name: 'Footwear', parentName: 'Shopping' },
      { name: 'Apps', parentName: 'Shopping' },
      { name: 'Fitness', parentName: 'Health & Fitness' },
      { name: 'Doctor', parentName: 'Health & Fitness' },
      { name: 'Personal care', parentName: 'Health & Fitness' },
      { name: 'Pharmacy', parentName: 'Health & Fitness' },
      { name: 'Sports', parentName: 'Health & Fitness' },
      { name: 'Barber', parentName: 'Health & Fitness' },
      { name: 'Books', parentName: 'Education' },
      { name: 'Streaming service', parentName: 'Entertainment' },
      { name: 'Games', parentName: 'Entertainment' },
      { name: 'Movies', parentName: 'Entertainment' },
      { name: 'Musics', parentName: 'Entertainment' },
      { name: 'Friends & Lover', parentName: 'Gift & Donation' },
      { name: 'Funeral', parentName: 'Gift & Donation' },
      { name: 'Marriage', parentName: 'Gift & Donation' },
      { name: 'Lucky money', parentName: 'Gift & Donation' },
      { name: 'Hotel', parentName: 'Travel' },
    ];
  }
}
