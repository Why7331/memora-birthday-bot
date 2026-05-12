type GlassToggleProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function GlassToggle({ checked, label, onChange }: GlassToggleProps) {
  return (
    <label className="glass-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}
