import { NavigationContainer } from '@react-navigation/native'

import { useAuth } from '../hooks/useAuth';

import { AppRoutes } from './app.routes'
import { SignIn } from '../screens/SignIn'
import { View } from 'react-native';

export function Routes() {
  const { user } = useAuth()

  return (
    <View className="flex-1 bg-background">
      <NavigationContainer>
        {user.name ? <AppRoutes /> : <SignIn />}
      </NavigationContainer>
    </View>
  )
}