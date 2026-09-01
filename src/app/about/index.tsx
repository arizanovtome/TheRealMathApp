import { AppScreen } from '@/components/common/AppScreen';
import { AboutBuildDetails } from '@/components/settings/AboutBuildDetails';

export default function AboutScreen() {
  return (
    <AppScreen scroll>
      <AboutBuildDetails />
    </AppScreen>
  );
}
