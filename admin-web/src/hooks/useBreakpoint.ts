import { useMemo } from 'react';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 * Хук для определения размера экрана
 * Возвращает объект с breakpoints и флаги для мобильных устройств
 */
export function useScreenSize() {
  const screens = useBreakpoint();
  
  return useMemo(() => {
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const isDesktop = screens.lg;
    
    return {
      ...screens,
      isMobile,
      isTablet,
      isDesktop,
    };
  }, [screens]);
}

