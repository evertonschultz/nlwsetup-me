import { AntDesign } from '@expo/vector-icons';

import Logo from '../assets/logo.svg';
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import colors from 'tailwindcss/colors';

export function SignIn() {
  const { signIn, signInWithStorageToken, isUserLoading } = useAuth()

  useEffect(() => {
    signInWithStorageToken()
  }, [])

  return (
    <View className="flex-1 bg-background items-center justify-center p-7">
      <Logo width={212} height={40} />

      <TouchableOpacity
        className="w-full h-14 flex-row items-center justify-center bg-violet-600 rounded-md mt-6"
        onPress={() => signIn()}
        disabled={isUserLoading}
      >
        {
          isUserLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <AntDesign name="google" size={20} color={colors.white} />
              <Text className="font-semibold text-base text-white ml-2" >
                ENTRAR COM O GOOGLE
              </Text>
            </>
          )
        }
        
      </TouchableOpacity>

      <Text className="text-white text-center mt-4">
        Não utilizamos nenhuma informação além {'\n'}
        do seu e-mail para criação de sua conta.
      </Text>
    </View>
  )
}