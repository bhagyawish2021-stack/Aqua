export function getErrorMsg(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (typeof err === 'string') return err;

  const data = err?.response?.data;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.message === 'string') return data.message;

  if (typeof err.message === 'string') return err.message;
  return 'Something went wrong. Please try again.';
}
