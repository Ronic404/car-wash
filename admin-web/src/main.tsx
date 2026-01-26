import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import AppNotificationProvider from './components/AppNotificationProvider';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './styles/index.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    locale={ruRU}
    theme={{
      token: {
        // Tooltip / Popover background should be solid (default is semi-transparent)
        colorBgSpotlight: '#111827', // slate-900
        colorTextLightSolid: '#FFFFFF',
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ErrorBoundary>
          <AppNotificationProvider>
            <App />
          </AppNotificationProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </ConfigProvider>
);

