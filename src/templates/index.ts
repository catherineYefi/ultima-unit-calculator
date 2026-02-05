import { TemplateRegistry } from './types';
import { subscriptionTemplate } from './subscription';

export const templates: TemplateRegistry = {
  subscription: subscriptionTemplate,
  // Остальные шаблоны добавим позже
};

export { subscriptionTemplate };