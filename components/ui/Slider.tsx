'use client';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  showValue?: boolean;
}

export default function Slider({ label, min, max, value, onChange, showValue = true }: SliderProps) {
  return (
    <div>
      <p className="text-[10px] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-1"
        />
        {showValue && (
          <span className="text-[11px] w-4 text-right">{value}</span>
        )}
      </div>
    </div>
  );
}
