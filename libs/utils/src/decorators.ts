import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidationOptions,
} from 'class-validator';

interface IBasicParameterOptions {
  required: boolean;
  description?: string;
  validationOptions?: ValidationOptions;
}

interface IStringParameterOptions extends IBasicParameterOptions {
  minLength?: number;
  maxLength?: number;
}

interface IIntegerParameterOptions extends IBasicParameterOptions {
  min?: number;
  max?: number;
}

export function StringParameter({
  required,
  description,
  validationOptions,
  minLength,
  maxLength,
}: IStringParameterOptions) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiProperty({
      type: 'string',
      required,
      description,
    }),
    IsString(validationOptions),
    required ? IsNotEmpty() : IsOptional(),
  ];

  if (!!minLength || !!maxLength) {
    decorators.push(IsByteLength(minLength || 0, maxLength));
  }

  return applyDecorators(...decorators);
}

export function IntegerParameter({
  required,
  description,
  validationOptions,
  min,
  max,
}: IIntegerParameterOptions) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiProperty({
      type: 'integer',
      required,
      description,
    }),
    IsInt(validationOptions),
    required ? IsNotEmpty() : IsOptional(),
  ];

  if (!!min) {
    decorators.push(Min(min));
  }

  if (!!max) {
    decorators.push(Max(max));
  }

  return applyDecorators(...decorators);
}

export function EnumParameter(
  entity: Record<string, unknown>,
  { required, description, validationOptions }: IBasicParameterOptions,
) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiProperty({
      enum: Object.values(entity),
      required,
      description,
    }),
    IsEnum(entity, validationOptions),
    required ? IsNotEmpty() : IsOptional(),
  ];

  return applyDecorators(...decorators);
}
