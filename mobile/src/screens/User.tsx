import { Text, View, ScrollView, Alert, Image, TouchableOpacity, TextInput, ToastAndroid } from "react-native";
import { Feather } from '@expo/vector-icons'
import { AntDesign } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { api } from '../lib/axios'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'
import colors from 'tailwindcss/colors'

import { DAY_SIZE, HabitDay } from "../components/HabitDay";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../hooks/useAuth";
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()
const minimunSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimunSummaryDatesSizes - datesFromYearStart.length

type SummaryProps = Array<{
  id: string
  date: string
  amount: number
  completed: number
}>
type User = {
  id: string,
  name: string,
  email: string,
  avatarUrl: string,
  countHabits: number
}

export function User() {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryProps>([])
  const [user, setUser] = useState<User>({} as User)
  const [userLoggedData, setUserLoggedData] = useState<User>({} as User)
  const [userId, setUserId] = useState('')

  const { signOut, user: userLogged } = useAuth()

  async function copyToClipboard() {
    await Clipboard.setStringAsync(`${userLogged.sub}`);
    ToastAndroid.show('Copiado!', ToastAndroid.SHORT);
  };

  async function fetchData() {
    if (!userId.length) {
      return Alert.alert('Ops', 'Você esqueceu de informar o id de usuário.')
    }
    try {
      setLoading(true)
      const response = await api.get(`user/${userId}`);

      if (!response.data.summary && !response.data.user) {
        return Alert.alert('Erro', 'Verifique se o id de usuário está correto.')
      }

      setSummary(response.data.summary)
      setUser(response.data.user)
    } catch (error) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  function toastHabitDay(amount: number, completed: number) {
    if(amount > 0)
      ToastAndroid.show(`${completed} / ${amount}`, ToastAndroid.SHORT);
  }

  async function getDataByUserLogged() {
    try {
      setLoading(true)
      const response = await api.get(`user/${userLogged.sub}`);

      if (!response.data.summary && !response.data.user) {
        return Alert.alert('Erro', 'Foi encontrado um erro no seu perfil! Faça login novamente.')
      }

      setUserLoggedData(response.data.user)
    } catch (error) {
      Alert.alert('Ops', 'Seu perfil não pode ser carregado')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDataByUserLogged()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <View className="flex-row items-center justify-between gap-4 mb-4 mt-0">
        <BackButton />

        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row h-11 px-4 border border-violet-500 rounded-lg items-center"
          onPress={signOut}
        >
          <Feather
            name="log-out"
            color={colors.violet[500]}
            size={20}
          />
          <Text className="text-white ml-3 font-semibold text-base">
            Sair
          </Text>
        </TouchableOpacity>
      </View>

      {
        !user.id &&
        <>
          <View className="flex flex-row gap-3 mt-0">
            <Image
              source={{ uri: userLoggedData.avatarUrl }}
              className="w-24 h-24 rounded-md"
            />
            <View className="flex flex-col">
              <Text className="text-gray-100 text-xl">{userLoggedData.name}</Text>
              <Text className="text-gray-100 text-md mt-1">{userLoggedData.email}</Text>
              <Text className="text-gray-100 text-md mt-2">{userLoggedData.countHabits} <Text className="text-gray-300 text-sm">hábitos criados</Text></Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 mb-4 mt-0">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row h-11 px-4 border border-violet-500 rounded-lg items-center"
              onPress={copyToClipboard}
            >
              <AntDesign
                name="sharealt"
                size={20}
                color={colors.violet[500]}
              />
              <Text className="text-white ml-3 font-semibold text-base">
                Compartilhe seu id de perfil
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
      {
        !user.id ?
          <View>
            <Text className="mt-2 text-white font-semibold text-base">
              Ver perfil público de usuários.
            </Text>

            <View className="flex flex-row items-center gap-2 mt-2">
              <TextInput
                className="h-11 px-4 rounded-lg bg-zinc-900 text-white border-2 border-zinc-800 focus:border-violet-600"
                placeholder="cole aqui o id do usuário"
                placeholderTextColor={colors.zinc[400]}
                onChangeText={setUserId}
                value={userId}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row h-11 px-4 border border-violet-500 rounded-lg items-center"
                onPress={fetchData}
              >
                <Feather
                  name="search"
                  color={colors.violet[500]}
                  size={20}
                />
                <Text className="text-white ml-3 font-semibold text-base">
                  Procurar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          :
          <Text className="mt-2 text-white font-semibold text-base">
            Perfil público do usuário. {' '}
            <Text
              className="text-violet-400 text-base underline active:text-violet-500"
              onPress={() => {
                setUser({} as User)
                setUserId('')
              }}>
              Limpar pesquisa
            </Text>
          </Text>
      }
      {
        user.id &&
        <>
          <View className="flex flex-row gap-3 mt-2">
            <Image
              source={{ uri: user.avatarUrl }}
              className="w-24 h-24 rounded-md"
            />
            <View className="flex flex-col">
              <Text className="text-gray-100 text-xl">{user.name}</Text>
              <Text className="text-gray-100 text-md mt-1">{user.email}</Text>
              <Text className="text-gray-100 text-md mt-2">{user.countHabits} <Text className="text-gray-300 text-sm">hábitos criados</Text></Text>
            </View>
          </View>

          <View className="flex-row mt-6 mb-2">
            {
              weekDays.map((weekDay, i) => (
                <Text
                  key={`${weekDay}-${i}`}
                  className="text-zinc-400 text-xl font-bold text-center mx-1"
                  style={{ width: DAY_SIZE }}
                >
                  {weekDay}
                </Text>
              ))
            }
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {
              summary &&
              <View className="flex-row flex-wrap">
                {
                  datesFromYearStart.map(date => {
                    const dayWithHabits = summary.find(day => {
                      return dayjs(date).isSame(day.date, 'day')
                    })
                    return (
                      <HabitDay
                        key={date.toISOString()}
                        date={date}
                        amountOfHabits={dayWithHabits?.amount}
                        amountCompleted={dayWithHabits?.completed}
                        onPress={() => toastHabitDay(
                          dayWithHabits?.amount ? dayWithHabits.amount : 0,
                          dayWithHabits?.completed ? dayWithHabits.completed : 0
                        )}
                      />
                    )
                  }
                  )
                }
                {
                  amountOfDaysToFill > 0 && Array
                    .from({ length: amountOfDaysToFill })
                    .map((_, index) => (
                      <View
                        key={index}
                        className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                        style={{ width: DAY_SIZE, height: DAY_SIZE }}
                      />
                    ))
                }
              </View>
            }
          </ScrollView>
        </>
      }

    </View>
  )
}