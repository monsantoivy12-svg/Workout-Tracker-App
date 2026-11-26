import { useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { applyTheme } from '../constants/theme';
import { selectPreference, setPreference } from '../store/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const systemScheme = useColorScheme(); // 'light' | 'dark' gikan sa phone
  const preference = useSelector(selectPreference);

  // kung 'system', sundon ang phone; kung dili, ang gipili sa user
  const mode = preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  // i-apply ang colors una sa wala pa mo-render ang mga screen
  applyTheme(mode);

  return {
    mode,
    isDark: mode === 'dark',
    preference,
    setPreference: (p) => dispatch(setPreference(p)),
    toggle: () => dispatch(setPreference(mode === 'dark' ? 'light' : 'dark')),
  };
};