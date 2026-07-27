/**
 * Tab Layout — Bottom tab bar with light theme styling
 */

import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../src/components/navigation/CustomTabBar';
import { useLanguage } from '../../src/context/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabDashboard'),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: t('tabHabits'),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tabTasks'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabCalendar'),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabAnalytics'),
        }}
      />
    </Tabs>
  );
}
