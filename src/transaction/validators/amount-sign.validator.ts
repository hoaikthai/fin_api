import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { TransactionType } from '../../common/enums';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

export function IsAmountSignValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAmountSignValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const obj = args.object as
            | CreateTransactionDto
            | UpdateTransactionDto;
          const type = obj.type;
          const amount = value;

          if (type && typeof amount === 'number') {
            if (type === TransactionType.INCOME && amount <= 0) {
              return false;
            }
            if (type === TransactionType.EXPENSE && amount >= 0) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as
            | CreateTransactionDto
            | UpdateTransactionDto;
          const type = obj.type;

          if (type === TransactionType.INCOME) {
            return 'Amount must be positive for income transactions';
          }
          if (type === TransactionType.EXPENSE) {
            return 'Amount must be negative for expense transactions';
          }

          return 'Invalid amount sign for transaction type';
        },
      },
    });
  };
}
