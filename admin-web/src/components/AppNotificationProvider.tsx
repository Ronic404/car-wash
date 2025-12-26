import { createContext, useContext, useMemo, CSSProperties, ReactNode } from 'react';
import { Button, notification } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';

export type AppNotificationType = 'success' | 'info' | 'warning' | 'error';

export interface IAppNotificationOptions {
  type?: AppNotificationType;
  key?: string;
  message: ReactNode;
  description?: ReactNode;
  duration?: number; // seconds; 0 = не закрывать автоматически
  style?: CSSProperties;
  action?: {
    text: string;
    onClick: () => void;
    closeOnClick?: boolean;
  };
}

export interface IAppNotificationApi {
  notify: (options: IAppNotificationOptions) => void;
  destroy: (key?: string) => void;
}

const AppNotificationContext = createContext<IAppNotificationApi | null>(null);

function openTyped(api: NotificationInstance, type: AppNotificationType | undefined, cfg: Parameters<NotificationInstance['open']>[0]) {
  if (type === 'success') return api.success(cfg);
  if (type === 'info') return api.info(cfg);
  if (type === 'warning') return api.warning(cfg);
  if (type === 'error') return api.error(cfg);
  return api.open(cfg);
}

export function useAppNotification(): IAppNotificationApi {
  const ctx = useContext(AppNotificationContext);
  if (!ctx) {
    throw new Error('useAppNotification() должен использоваться внутри <AppNotificationProvider />');
  }
  return ctx;
}

export default function AppNotificationProvider(props: { children: ReactNode }) {
  const [api, contextHolder] = notification.useNotification({
    placement: 'topRight',
    maxCount: 5,
  });

  const value = useMemo<IAppNotificationApi>(() => {
    return {
      notify: (options) => {
        const duration = options.duration ?? 0; // по умолчанию висит, пока не закроют

        const baseStyle: CSSProperties = {
          border: '1px solid rgba(0, 0, 0, 0.15)',
          boxShadow:
            '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
          background: '#fff',
        };

        openTyped(api, options.type, {
          key: options.key,
          message: options.message,
          description: options.description,
          duration,
          style: { ...baseStyle, ...(options.style ?? {}) },
          btn: options.action
            ? (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  const action = options.action;
                  if (action?.closeOnClick !== false && options.key) {
                    api.destroy(options.key);
                  }
                  action?.onClick();
                }}
              >
                {options.action.text}
              </Button>
            )
            : undefined,
        });
      },
      destroy: (key) => api.destroy(key),
    };
  }, [api]);

  return (
    <AppNotificationContext.Provider value={value}>
      {contextHolder}
      {props.children}
    </AppNotificationContext.Provider>
  );
}


