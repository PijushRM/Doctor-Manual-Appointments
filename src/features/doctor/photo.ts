import {serverImage} from 'src/services/api';
import type {DoctorProfile} from 'src/types/clinic';

// The server's photo (with the login header), or none.
export const profilePhotoSource = (profile: Pick<DoctorProfile, 'photoUrl'>) =>
  profile.photoUrl ? serverImage(profile.photoUrl) : null;
