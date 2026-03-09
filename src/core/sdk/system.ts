import type { BatteryInfo, NotificationOptions, SystemPermission } from './types';

/**
 * 系统能力 API
 * 应用通过此模块与宿主系统交互
 */
class SystemAPIClass {
  private permissions: Set<SystemPermission> = new Set();

  /**
   * 请求系统权限
   */
  requestPermission(permission: SystemPermission): boolean {
    // 在实际实现中，这里会触发系统权限弹窗
    // 当前为简化版本，直接返回 true
    this.permissions.add(permission);
    return true;
  }

  /**
   * 检查是否拥有指定权限
   */
  hasPermission(permission: SystemPermission): boolean {
    return this.permissions.has(permission);
  }

  /**
   * 获取电池信息
   */
  async getBatteryInfo(): Promise<BatteryInfo> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      }
    } catch (e) {
      console.warn('Battery API not available');
    }
    // 返回默认值
    return {
      level: 100,
      charging: false,
    };
  }

  /**
   * 触发设备震动
   */
  vibrate(pattern: number | number[] = 200): boolean {
    if ('vibrate' in navigator) {
      return navigator.vibrate(pattern);
    }
    return false;
  }

  /**
   * 发送系统通知
   */
  async notify(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Notification API not available');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          tag: options.tag,
        });
      }
    }
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): { platform: string; userAgent: string } {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * 获取系统主题
   */
  getTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * 监听主题变化
   */
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
}

// 单例实例
export const SystemAPI = new SystemAPIClass();
export const systemApi = SystemAPI; // 兼容写法
