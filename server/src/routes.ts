import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import z from 'zod'
import dayjs from 'dayjs'
import { authenticate } from './plugins/authenticate'
import { api } from './lib/axios'

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', {
    onRequest: [authenticate]
  }, async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(
        z.number().min(0).max(6)
      )
    })

    const { title, weekDays } = createHabitBody.parse(request.body)
    const userId = request.user.sub

    const today = dayjs().startOf('day').toDate() // data atual / zera as horas, minutos e segundos / transforma em um objeto Date do javascript

    await prisma.habit.create({
      data: {
        user_id: userId,
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    })
  })

  app.get('/day', {
    onRequest: [authenticate]
  }, async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date() // '.coerce' pega a data em formato de string enviada pelo frontend e a trasnforma em uma data
    })

    const { date } = getDayParams.parse(request.query)

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date, // 'lte' menor ou igual
        },
        weekDays: {
          some: {
            week_day: weekDay,
          }
        },
        user_id: request.user.sub
      }
    })

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
        dayHabits: {
          some: {
            user_id: request.user.sub
          }
        }
      },
      include: {
        dayHabits: true,
      }
    })

    const completedHabitsFilterByUserId = day?.dayHabits.filter(dayHabit => dayHabit.user_id === request.user.sub)

    const completedHabits = completedHabitsFilterByUserId?.map(dayHabit => {
      return dayHabit.habit_id
    }) ?? []

    console.log('possibleHabits:', possibleHabits)
    console.log('completedHabits:', completedHabits)

    return {
      possibleHabits,
      completedHabits
    }
  })

  app.patch('/habits/:id/toggle', {
    onRequest: [authenticate]
  }, async (request) => {

    console.log('/habits/:id/toggle:')

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = toggleHabitParams.parse(request.params)

    const today = dayjs().startOf('day').toDate()

    let day = await prisma.day.findUnique({
      where : {
        date: today,
      }
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        }
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        }
      }
    })

    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        }
      })
    } else {
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
          user_id: request.user.sub,
        }
      })
    }
  })

  app.get('/summary', {
    onRequest: [authenticate]
  }, async (request) => {
    const summary = await prisma.$queryRaw`
      SELECT 
        D.id,
        D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
          AND DH.user_id = ${request.user.sub}
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
            AND H.user_id = ${request.user.sub}
        ) as amount
      FROM days D
    `

    return summary
  })

  app.get('/me', {
    onRequest: [authenticate],
  }, async (request) => {
    return { user: request.user }
  })

  app.post('/users', async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    })

    const { access_token } = createUserBody.parse(request.body)

    const userResponse = await api.get('oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      }
    })

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        }
      })
    }

    const token = app.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl,
    }, {
      sub: user.id,
      expiresIn: '7 dias',
    })

    return { token }
  })
}