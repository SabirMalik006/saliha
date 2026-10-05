import { FlaskConical } from 'lucide-react';
import { appConfig } from '@/config/env';

/**
 * Shown only while the development mock adapter is enabled, so nobody mistakes
 * sample content for a connected production backend.
 */
export function DevModeBanner() {
  if (!appConfig.useMockApi) return null;

  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-[0.8125rem] font-medium text-amber-900 ring-1 ring-inset ring-amber-200"
    >
      <span className="inline-flex items-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Development mode — sample data is served by the local mock API
        (<code className="rounded bg-amber-200/70 px-1 py-0.5 font-mono text-[0.75rem]">
          VITE_USE_MOCK_API=true
        </code>
        ). Set it to <code className="font-mono text-[0.75rem]">false</code> to use the real
        backend.
      </span>
    </div>
  );
}