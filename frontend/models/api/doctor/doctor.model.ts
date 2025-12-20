import type { User } from '../../auth';
import type { Patient } from '../patient';

export interface Doctor extends User {
    patients: Patient[];
}
