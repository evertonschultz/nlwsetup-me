import './src/lib/dayjs'
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';

import { Platform, StatusBar } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from '@expo-google-fonts/inter'
import { Loading } from './src/components/Loading';
import { Routes } from './src/routes';
import { AuthContextProvider } from './src/contexts/AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  })
})
import { getPushNotificationToken } from './src/services/getPushNotificationToken';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { api } from './src/lib/axios';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold
  })

  const getNotificationListener = useRef<Subscription>();
  const responseNotificationListener = useRef<Subscription>();

  useEffect(() => {
    getPushNotificationToken();
  })

  useEffect(() => {
    getNotificationListener.current = Notifications
    .addNotificationReceivedListener(notifiction => {
      console.log(notifiction);
    });

    responseNotificationListener.current = Notifications
    .addNotificationResponseReceivedListener(response => {
      console.log(response)
    });

    return () => {
      if (getNotificationListener.current && responseNotificationListener.current) {
        Notifications.removeNotificationSubscription(getNotificationListener.current);
        Notifications.removeNotificationSubscription(responseNotificationListener.current);
      }
    }
  })

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

useEffect(() => {registerForPushNotificationsAsync()}, [])

//    async function schedulePushNotification() {
//      const today = dayjs().toISOString()
//      try {
//        const response = await api.get('/day', { params: { today }})
//
//        if(response.data.possibleHabits.length > response.data.completedHabits.length)
//        
//        await Notifications.scheduleNotificationAsync({
//          content: {
//            title: "Hábitos pendentes! 🙌",
//            body: 'Não perca seus hábitos. Você tem hábitos para concluir hoje',
//          },
//          trigger: {
//            seconds: 2,
//            repeats: false,
//          },
//        });
//      } catch (error) {}
//    }
//
//    setInterval(schedulePushNotification, 100) // 8 horas

  if (!fontsLoaded) {
    return <Loading />
  }

  return (
    <AuthContextProvider>
      <Routes />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    </AuthContextProvider>
  );
}
