import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class ReorderDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  ids: string[];
}
