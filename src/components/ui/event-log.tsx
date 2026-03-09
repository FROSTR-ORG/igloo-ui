import * as React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './icon-button';
import { LogEntryComponent, type LogEntryData } from './log-entry';

export type LogEntry = LogEntryData;

export function EventLog({ entries, onClear }: { entries: LogEntry[]; onClear?: () => void }) {
  const [collapsed, setCollapsed] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, collapsed]);

  return (
    <div className="overflow-hidden rounded-lg border border-blue-900/30">
      <div className="flex items-center justify-between bg-gray-800/30 px-4 py-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex flex-1 items-center gap-3 transition-opacity hover:opacity-80"
        >
          {collapsed ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
          <span className="font-medium text-blue-300">Event Log</span>
          <div className={cn('h-2 w-2 rounded-full', entries.length > 0 ? 'bg-green-500' : 'bg-gray-500')} />
          <span className="rounded bg-gray-500/20 px-2 py-0.5 text-xs text-gray-400">{entries.length} events</span>
          <span className="text-xs text-gray-400">{collapsed ? 'Click to expand' : 'Click to collapse'}</span>
        </button>
        {onClear && entries.length > 0 && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={onClear}
            tooltip="Clear log"
            className="text-gray-400 hover:text-red-400"
          />
        )}
      </div>

      {!collapsed && (
        <div ref={scrollRef} className="max-h-[280px] space-y-2 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No events yet</p>
          ) : (
            entries.map((entry) => <LogEntryComponent key={entry.id} log={entry} />)
          )}
        </div>
      )}
    </div>
  );
}
