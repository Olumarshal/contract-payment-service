import { IsNotEmpty, IsNumber } from 'class-validator';

export class DepositBalanceDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
