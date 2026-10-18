export default function PageHead({ title, sub, right }) {
  return (
    <div className="phead">
      <div><h2>{title}</h2>{sub && <p className="sm">{sub}</p>}</div>
      {right}
    </div>
  );
}
