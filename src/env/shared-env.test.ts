import {
  createOptionalPositiveIntegerFromEnvSchema,
  optionalBooleanFromEnvSchema,
  optionalTrimmedStringFromEnvSchema,
} from '@/env/shared-env';
import { captureThrownError, expectZodIssue } from '@/env/env-test-helpers';

describe('optionalTrimmedStringFromEnvSchema', () => {
  it('should trim string value when raw env value has surrounding whitespace', () => {
    expect(optionalTrimmedStringFromEnvSchema.parse(' value ')).toBe('value');
  });

  it('should return undefined when raw env value is missing', () => {
    expect(optionalTrimmedStringFromEnvSchema.parse(undefined)).toBeUndefined();
  });

  it('should return undefined when raw env value is blank', () => {
    expect(optionalTrimmedStringFromEnvSchema.parse('   ')).toBeUndefined();
  });
});

describe('optionalBooleanFromEnvSchema', () => {
  it.each([
    ['true', true],
    ['1', true],
    ['false', false],
    ['0', false],
  ])('should parse %s into %s when raw env value is supported', (rawValue, expectedValue) => {
    expect(optionalBooleanFromEnvSchema.parse(rawValue)).toBe(expectedValue);
  });

  it('should return undefined when raw env value is blank', () => {
    expect(optionalBooleanFromEnvSchema.parse('   ')).toBeUndefined();
  });

  it('should report invalid boolean-like env value when raw env value is unsupported', () => {
    const error = captureThrownError(() => optionalBooleanFromEnvSchema.parse('maybe'));

    expectZodIssue(error, {
      code: 'invalid_type',
      message: 'Expected boolean-like env value: use true/false/1/0',
      path: [],
    });
  });
});

describe('createOptionalPositiveIntegerFromEnvSchema', () => {
  const schema = createOptionalPositiveIntegerFromEnvSchema('TEST_ENV');

  it('should parse positive integer when raw env value is valid', () => {
    expect(schema.parse('120')).toBe(120);
  });

  it('should return undefined when raw env value is missing', () => {
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it('should return undefined when raw env value is blank', () => {
    expect(schema.parse('   ')).toBeUndefined();
  });

  it.each(['0', 'abc'])(
    'should report invalid integer when raw env value is %s',
    (invalidValue) => {
      const error = captureThrownError(() => schema.parse(invalidValue));

      expectZodIssue(error, {
        code: 'custom',
        message: `TEST_ENV must be a positive integer (got "${invalidValue}")`,
        path: [],
      });
    },
  );
});
