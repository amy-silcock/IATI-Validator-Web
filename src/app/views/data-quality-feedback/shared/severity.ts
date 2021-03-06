import { TypeMessage } from './type-message';
export class Severity {
  id: string;
  slug: string;
  name: string;
  description: string;
  count: number;
  order: number;
  show: boolean;
  types: TypeMessage[];
}
