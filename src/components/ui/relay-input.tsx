import * as React from 'react';
import { Plus } from 'lucide-react';
import { IconButton } from './icon-button';
import { Input } from './input';

type RelayInputProps = {
  relays: string[];
  onChange: (relays: string[]) => void;
  normalizeRelays: (relays: string[]) => { relays: string[]; errors: string[] };
};

export function RelayInput({ relays, onChange, normalizeRelays }: RelayInputProps) {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  function add() {
    const next = value.trim();
    if (!next) return;
    const normalized = normalizeRelays([...relays, next]);
    if (normalized.errors.length > 0) {
      setError(normalized.errors[0]);
      return;
    }
    onChange(normalized.relays);
    setValue('');
    setError(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="wss://relay.example"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="font-mono text-sm"
        />
        <IconButton variant="outline" size="default" icon={<Plus className="h-4 w-4" />} onClick={add} tooltip="Add" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
