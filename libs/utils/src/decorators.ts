import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidationOptions,
} from 'class-validator';

interface BasicParameterOptions {
  required: boolean;
  description?: string;
  validationOptions?: ValidationOptions;
}

interface StringParameterOptions extends BasicParameterOptions {
  minLength?: number;
  maxLength?: number;
}

interface IntegerParameterOptions extends BasicParameterOptions {
  min?: number;
  max?: number;
}

export function StringParameter({
  required,
  description,
  validationOptions,
  minLength,
  maxLength,
}: StringParameterOptions) {
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
}: IntegerParameterOptions) {
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
  { required, description, validationOptions }: BasicParameterOptions,
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

export function DateParameter({
  required,
  description,
  validationOptions,
}: BasicParameterOptions) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiProperty({
      type: 'string',
      format: 'date-time',
      required,
      description,
    }),
    IsDateString({ strict: false }, validationOptions),
    required ? IsNotEmpty() : IsOptional(),
  ];

  return applyDecorators(...decorators);
}
