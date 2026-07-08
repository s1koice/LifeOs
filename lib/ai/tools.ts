import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { GoalStatus, TaskPriority, TaskStatus } from "@prisma/client";
import { toDateKey } from "@/lib/date";

export function getAssistantTools(userId: string, timezone: string) {
  return {
    listGoals: tool({
      description: "Получить список целей пользователя со статусом и прогрессом",
      parameters: z.object({
        status: z
          .enum(["ACTIVE", "COMPLETED", "PAUSED", "ARCHIVED"])
          .optional()
          .describe("Фильтр по статусу"),
      }),
      execute: async ({ status }) => {
        const goals = await prisma.goal.findMany({
          where: { userId, ...(status ? { status: status as GoalStatus } : {}) },
          orderBy: { deadline: "asc" },
        });
        return goals.map((g) => ({
          id: g.id,
          title: g.title,
          status: g.status,
          progress: g.progress,
          deadline: g.deadline,
          category: g.category,
        }));
      },
    }),

    createGoal: tool({
      description: "Создать новую цель",
      parameters: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        deadline: z.string().optional().describe("Дата в формате YYYY-MM-DD"),
      }),
      execute: async ({ title, description, category, deadline }) => {
        const goal = await prisma.goal.create({
          data: {
            userId,
            title,
            description,
            category,
            deadline: deadline ? new Date(deadline) : null,
          },
        });
        return { id: goal.id, title: goal.title };
      },
    }),

    updateGoal: tool({
      description: "Обновить цель: статус, прогресс, название, дедлайн",
      parameters: z.object({
        id: z.string(),
        title: z.string().optional(),
        status: z.enum(["ACTIVE", "COMPLETED", "PAUSED", "ARCHIVED"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        deadline: z.string().optional(),
      }),
      execute: async ({ id, title, status, progress, deadline }) => {
        const goal = await prisma.goal.updateMany({
          where: { id, userId },
          data: {
            ...(title ? { title } : {}),
            ...(status ? { status: status as GoalStatus } : {}),
            ...(progress !== undefined ? { progress } : {}),
            ...(deadline ? { deadline: new Date(deadline) } : {}),
          },
        });
        return { updated: goal.count > 0 };
      },
    }),

    listTasks: tool({
      description: "Получить список задач пользователя",
      parameters: z.object({
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
        onlyToday: z.boolean().optional().describe("Только задачи со сроком сегодня"),
      }),
      execute: async ({ status, onlyToday }) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const tasks = await prisma.task.findMany({
          where: {
            userId,
            ...(status ? { status: status as TaskStatus } : {}),
            ...(onlyToday ? { dueDate: { gte: todayStart, lt: todayEnd } } : {}),
          },
          orderBy: { priority: "desc" },
          include: { goal: { select: { title: true } } },
        });
        return tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          goal: t.goal?.title ?? null,
        }));
      },
    }),

    createTask: tool({
      description: "Создать новую задачу, опционально привязать к цели по её id",
      parameters: z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z.string().optional().describe("Дата в формате YYYY-MM-DD"),
        goalId: z.string().optional(),
      }),
      execute: async ({ title, description, priority, dueDate, goalId }) => {
        const task = await prisma.task.create({
          data: {
            userId,
            title,
            description,
            priority: (priority as TaskPriority) ?? "MEDIUM",
            dueDate: dueDate ? new Date(dueDate) : null,
            goalId: goalId ?? null,
          },
        });
        return { id: task.id, title: task.title };
      },
    }),

    updateTask: tool({
      description: "Обновить задачу: статус, приоритет, срок, название",
      parameters: z.object({
        id: z.string(),
        title: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z.string().optional(),
      }),
      execute: async ({ id, title, status, priority, dueDate }) => {
        const task = await prisma.task.updateMany({
          where: { id, userId },
          data: {
            ...(title ? { title } : {}),
            ...(status ? { status: status as TaskStatus, completedAt: status === "DONE" ? new Date() : null } : {}),
            ...(priority ? { priority: priority as TaskPriority } : {}),
            ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
          },
        });
        return { updated: task.count > 0 };
      },
    }),

    listHabits: tool({
      description: "Получить список привычек с отметкой, выполнена ли она сегодня",
      parameters: z.object({}),
      execute: async () => {
        const habits = await prisma.habit.findMany({
          where: { userId, archived: false },
          include: {
            entries: {
              where: { date: { gte: new Date(toDateKey(new Date(), timezone)) } },
            },
          },
        });
        return habits.map((h) => ({
          id: h.id,
          title: h.title,
          doneToday: h.entries.length > 0,
        }));
      },
    }),

    toggleHabitToday: tool({
      description: "Отметить привычку выполненной или снять отметку за сегодня, по id привычки",
      parameters: z.object({ habitId: z.string() }),
      execute: async ({ habitId }) => {
        const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
        if (!habit) return { error: "habit not found" };

        const dateKey = toDateKey(new Date(), timezone);
        const date = new Date(dateKey);
        const existing = await prisma.habitEntry.findUnique({
          where: { habitId_date: { habitId, date } },
        });

        if (existing) {
          await prisma.habitEntry.delete({ where: { id: existing.id } });
          return { habitId, doneToday: false };
        }
        await prisma.habitEntry.create({ data: { habitId, date, completed: true } });
        return { habitId, doneToday: true };
      },
    }),
  };
}
