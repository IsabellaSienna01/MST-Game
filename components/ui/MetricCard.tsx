interface MetricCardProps {
  label: string;
  value: string | number;
  color?: 'accent' | 'green' | 'orange' | 'white' | 'yellow';
}

const COLOR_MAP = {
  accent: 'text-accent',
  green: 'text-green-400',
  orange: 'text-orange-400',
  white: 'text-bright',
  yellow: 'text-yellow-400',
};

export default function MetricCard({ label, value, color = 'accent' }: MetricCardProps) {
  return (
    <div className="border border-gray-700 rounded-lg p-2 mb-1">
      <p className="text-[10px] uppercase">{label}</p>
      <p className={`text-lg font-bold ${COLOR_MAP[color]}`}>{value}</p>
    </div>
  );
}
