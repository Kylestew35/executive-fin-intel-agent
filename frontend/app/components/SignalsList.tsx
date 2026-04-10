export default function SignalsList({ signals }: { signals: any[] }) {
  return (
    <div className="space-y-2">
      {signals.map((s, i) => (
        <p key={i} className="text-slate-100 text-base">
          {s.message}
        </p>
      ))}
    </div>
  );
}
