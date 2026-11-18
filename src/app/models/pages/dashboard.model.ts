import { IconName } from '../../shared/icon/icon-name';

export interface DashboardMetric {
  label: string;
  value: number;
  icon: IconName;
  tone: string;
}

export interface Appointment {
  time: string;
  title: string;
  client: string;
}
