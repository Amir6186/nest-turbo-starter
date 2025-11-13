import { applyDecorators, Logger, Type } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  Expose,
  Transform,
  TransformFnParams,
  Type as TransformType,
} from 'class-transformer';
import {
  IsArray,
  isBoolean,
  isBooleanString,
  IsDate,
  isEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import _ from 'lodash';
import { ERROR_RESPONSE } from '../constants';
import { ValidationError } from '../errors';
import { ServerException } from '../exceptions';

type PropertyType = Type<unknown> | Function | Record<string, any> | 'file';

interface DtoPropertyOptions {
  type: PropertyType;
  structure?: 'array' | 'enum' | 'enumArray' | 'dto' | 'dtoArray';
  validated?: boolean;
  required?: boolean;
  example?: any;
  defaultValue?: any;
  description?: string;
  validateGroup?: string[];
}

/**
 * Specialized decorator for creating API Metadata (Swagger documentation).
 * It focuses solely on applying @ApiProperty with extended logic for enums, arrays, and file types.
 *
 * @param {DtoPropertyOptions} options - The property options containing Swagger-related metadata.
 * @returns {PropertyDecorator} The ApiProperty decorator.
 */
export function ApiPropertyExtended(options: DtoPropertyOptions): PropertyDecorator {
  if (options === undefined || _.isEmpty(options)) {
    return ApiProperty({
      required: false
    });
  }
  const { structure, ...propertyOptions } = options;

  const isFile = propertyOptions.type === 'file';
  const type = (isFile ? String : propertyOptions.type) as Type<unknown>;
  const isEnum = structure === 'enum' || structure === 'enumArray';
  const isArray = structure === 'array' || structure === 'enumArray' || structure === 'dtoArray';

  const example = _.get(propertyOptions, 'defaultValue', propertyOptions.example);

  const apiOptions: ApiPropertyOptions = {
    ...propertyOptions,
    type,
    ...(isFile && { format: 'binary' }),
    ...(isEnum && { enum: type, enumName: type.name }),
    isArray,
    example,
    required: propertyOptions.required,
  };

  return ApiProperty(apiOptions);
}


/**
 * Specialized decorator for applying Validation and Transformation rules (class-transformer, class-validator).
 * It handles logic for Expose, IsOptional/IsNotEmpty, setting default values, and type-specific validation (e.g., Boolean coercion, nested DTO validation).
 *
 * @param {DtoPropertyOptions} options - The property options containing validation/transformation rules.
 * @returns The decorators for the property.
 */
export function ValidateTransform(options: DtoPropertyOptions) {
  if (options === undefined || _.isEmpty(options)) {
    return applyDecorators(
      Expose(),
      IsOptional(),
      ValidateIf(() => isEmpty(options?.validateGroup))
    );
  }

  const { structure, validated, validateGroup, ...propertyOptions } = {
    validated: false,
    required: false,
    ...options,
  };

  const isFile = propertyOptions.type === 'file';
  const type = (isFile ? String : propertyOptions.type) as Type<unknown>;
  const isEnum = structure === 'enum' || structure === 'enumArray';
  const isDto = structure === 'dto' || structure === 'dtoArray';
  const isArray =
    structure === 'array' || structure === 'enumArray' || structure === 'dtoArray';

  const decorators: PropertyDecorator[] = [
    Expose(),
    ValidateIf(() => isEmpty(validateGroup)),
  ];

  if (propertyOptions.required && !isFile) {
    decorators.push(IsNotEmpty({ each: isArray, groups: validateGroup }));
  } else {
    decorators.push(IsOptional({ each: isArray, groups: validateGroup }));
  }

  if (_.has(propertyOptions, 'defaultValue')) {
    if (isDto) {
      throw new ValidationError(
        `Property ${type.name} is a DTO but defaultValue set. Please set defaultValue in child DTO instead`,
      );
    }
    if (propertyOptions.required) {
      throw new ValidationError(
        `Property ${type.name} is required but defaultValue set. Please remove defaultValue`,
      );
    }

    const setDefaultValue = Transform(({ value }: TransformFnParams) => {
      if (value === undefined) {
        if (!propertyOptions.defaultValue) return;
        return propertyOptions.defaultValue;
      }
      return value;
    });
    decorators.push(setDefaultValue);
  }

  if (isDto) {
    decorators.push(TransformType((obj) => type));
  }

  if (validated) {
    switch (type) {
      case String:
        decorators.push(IsString({ each: isArray, groups: validateGroup }));
        break;
      case Number:
        decorators.push(
          TransformType((obj) => Number),
          IsNumber({}, { each: isArray, groups: validateGroup }),
        );
        break;
      case Date:
        decorators.push(IsDate({ each: isArray, groups: validateGroup }));
        break;
      case Boolean:
        decorators.push(
          Transform((option) => {
            const { value, key } = option;
            if (isEmpty(value)) return;
            if (isBoolean(value)) return value;
            if (!isBooleanString(value)) {
              throw new ServerException({
                ...ERROR_RESPONSE.REQUEST_PAYLOAD_VALIDATION_ERROR,
                message: `Property ${key} is not boolean`,
                details: { isPropertyDto: true, debug: option },
              });
            }
            return value === 'true';
          }),
          TransformType((obj) => String),
        );
        break;
      default:
        if (type && !isEnum && !isDto) {
          Logger.warn(
            `Property type ${type.name} is not Primitive type but are not specified structure (enum, dto)`,
          );
        }
    }

    if (isArray) {
      decorators.push(IsArray({ groups: validateGroup }));
    }
    if (isEnum) {
      decorators.push(IsEnum(type, { each: isArray, groups: validateGroup }));
    }
    if (isArray && !isDto) {
      decorators.push(
        Transform(({ value }) => {
          if (isEmpty(value)) return value;
          if (Array.isArray(value)) return value;
          return [value];
        }),
      );
    }
    if (isDto) {
      decorators.push(
        ValidateNested({
          each: isArray,
          message: (arg) =>
            `Field ${arg.property} with type=${type.name} can not validate nested`,
          groups: validateGroup,
        }),
      );
    }
  }

  return applyDecorators(...decorators);
}

/**
 * Comprehensive decorator for DTO properties.
 * It combines API Documentation (Swagger) and Validation/Transformation logic.
 *
 * It ensures consistency by automatically applying:
 * 1. API Metadata via @ApiProperty.
 * 2. Serialization/Deserialization via @Expose.
 * 3. Type transformation (e.g., string to number, handling nested DTOs) via @Transform.
 * 4. Validation rules (required/optional, type checking, nested validation) via class-validator.
 *
 * @param {DtoPropertyOptions} options - The options for configuring the property.
 * @returns The decorators for the property.
 */
function PropertyDto(options?: DtoPropertyOptions) {
  return applyDecorators(
    ApiPropertyExtended(options),
    ValidateTransform(options),
  );
}

export { PropertyDto };
