import {serverImage} from 'src/services/api';
import type {DoctorProfile} from 'src/types/clinic';

// The local copy when this phone has one, else the server's (with login header).
export const profilePhotoSource = (
  profile: Pick<DoctorProfile, 'photoUri' | 'photoUrl'>,
) =>
  profile.photoUri
    ? {uri: profile.photoUri}
    : profile.photoUrl
    ? serverImage(profile.photoUrl)
    : null;
