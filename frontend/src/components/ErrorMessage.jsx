export default function ErrorMessage({ message }) {
  if (!message) return null;
  const text = typeof message === 'string'
    ? message
    : message?.message || (typeof message === 'object' ? JSON.stringify(message) : String(message));
  return <div className="alert alert-error">{text}</div>;
}
