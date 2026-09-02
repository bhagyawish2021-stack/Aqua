export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
