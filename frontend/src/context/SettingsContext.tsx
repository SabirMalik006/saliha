import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { defaultClinicSettings } from '@/constants/clinic';
import { settingsApi } from '@/services/settingsApi';
import type { ClinicSettings } from '@/types';

interface SettingsContextValue {
  settings: ClinicSettings;
  /** False until the settings request resolves (or fails). */
  isLoading: boolean;
  /** When true the values are the built-in fallbacks, not live API data. */
  isFallback: boolean;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Single source of truth for clinic contact details across the public site.
 * Components read from here instead of hardcoding phone numbers.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ClinicSettings>(defaultClinicSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await settingsApi.getPublic();
      setSettings(result);
      setIsFallback(false);
    } catch {
      // Keep the approved default contact details if the API is unavailable.
      setSettings(defaultClinicSettings);
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, isLoading, isFallback, reload }),
    [settings, isLoading, isFallback, reload],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside <SettingsProvider>.');
  }
  return context;
}