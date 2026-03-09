/**
 * 模板应用类型定义
 *
 * 在此定义应用专属的接口、类型
 */

// 示例：组件 Props 类型（通常放在同名 .tsx 文件中导出，此处仅作示例）
// export interface TemplateAppProps { ... }

// 示例：数据结构类型
export interface TemplateItem {
  id: string;
  title: string;
  description: string;
}

// 示例：状态类型
export interface TemplateState {
  items: TemplateItem[];
  isLoading: boolean;
  error: string | null;
}
