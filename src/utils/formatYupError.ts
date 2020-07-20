import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = [];
  err.inner.forEach(({ path, message }) => {
    errors.push({
      path,
      message,
    });
  });
  return errors;
};
