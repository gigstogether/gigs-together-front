import { ZodError } from 'zod';

export interface ExpectedZodIssue {
  readonly code: string;
  readonly message: string;
  readonly path: readonly (string | number)[];
}

export function expectZodIssue(error: unknown, expectedIssue: ExpectedZodIssue): void {
  expect(error).toBeInstanceOf(ZodError);

  if (!(error instanceof ZodError)) {
    throw new Error('Expected ZodError');
  }

  expect(error.issues).toContainEqual(expect.objectContaining(expectedIssue));
}

export function captureThrownError(action: () => void): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }

  throw new Error('Expected action to throw');
}

export function captureThrownErrorInstance(action: () => void): Error {
  const error = captureThrownError(action);

  if (error instanceof Error) {
    return error;
  }

  throw new Error('Expected thrown value to be an Error instance');
}

export async function captureRejectedError<T>(action: () => Promise<T>): Promise<unknown> {
  try {
    await action();
  } catch (error) {
    return error;
  }

  throw new Error('Expected action to reject');
}
