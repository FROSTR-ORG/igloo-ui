import * as React from 'react';
import { ChevronRight, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LogEntryData {
  time: string;
  level: string;
  message: string;
  data?: unknown;
  id: string;
}

const levelColors: Record<string, string> = {
  READY: 'text-green-400',
  INFO: 'text-blue-400',
  ERROR: 'text-red-400',
  SIGN: 'text-[#22C55E]',
  ECDH: 'text-[#22D3EE]',
  ECHO: 'text-emerald-400',
  PING: 'text-[#A855F7]',
  ONBOARD: 'text-[#FBBF24]',
};

function defaultFormatter(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    // SAFE fallback: never walk the value's prototype/keys, since the input
    // may be hostile or contain non-enumerable getters.
    if (Array.isArray(data)) return `[array, ${data.length} items]`;
    if (typeof data === 'object' && data !== null) return '[object]';
    return String(data);
  }
}

function boundString(
  value: string,
  maxLines: number,
  maxChars: number,
  marker: string,
): string {
  let result = value;
  let truncated = false;

  const lines = result.split('\n');
  if (lines.length > maxLines) {
    result = lines.slice(0, maxLines).join('\n');
    truncated = true;
  }

  if (result.length > maxChars) {
    result = result.slice(0, maxChars);
    truncated = true;
  }

  return truncated ? `${result}${marker}` : result;
}

export type LogEntryComponentProps = {
  log: LogEntryData;
  formatter?: (data: unknown) => string;
  maxChars?: number;
  maxLines?: number;
  truncationMarker?: string;
};

export function LogEntryComponent({
  log,
  formatter = defaultFormatter,
  maxChars = 8192,
  maxLines = 200,
  truncationMarker = '… (truncated)',
}: LogEntryComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasData = log.data !== undefined && log.data !== null;

  const handleClick = React.useCallback(() => {
    if (hasData) setIsExpanded((prev) => !prev);
  }, [hasData]);

  const formattedData = React.useMemo(() => {
    if (!hasData) return null;
    let raw: string;
    try {
      raw = formatter(log.data);
    } catch {
      raw = defaultFormatter(log.data);
    }
    return boundString(raw, maxLines, maxChars, truncationMarker);
  }, [log.data, hasData, formatter, maxChars, maxLines, truncationMarker]);

  return (
    <div className="rounded-lg border border-blue-900/20 bg-gray-800/30 transition-colors hover:bg-gray-800/50">
      <div
        className={cn('flex items-start gap-2 px-3 py-2', hasData && 'cursor-pointer select-none')}
        onClick={handleClick}
        role={hasData ? 'button' : undefined}
        tabIndex={hasData ? 0 : undefined}
        onKeyDown={
          hasData
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
      >
        {hasData ? (
          <div
            className="mt-0.5 flex-shrink-0 text-blue-400 transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        ) : (
          <div className="mt-0.5 flex-shrink-0 text-gray-600/50">
            <Circle className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-gray-500">{log.time}</span>
            <span className={cn('text-[11px] font-medium', levelColors[log.level] || 'text-gray-400')}>
              {log.level}
            </span>
          </div>
          <p className="text-sm text-blue-100">{log.message}</p>
        </div>
      </div>
      {hasData && (
        <div
          className={cn(
            'overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out',
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <pre className="mx-3 mb-3 overflow-x-auto rounded bg-gray-900/50 p-2 text-xs text-gray-400 shadow-inner">
            {formattedData}
          </pre>
        </div>
      )}
    </div>
  );
}
