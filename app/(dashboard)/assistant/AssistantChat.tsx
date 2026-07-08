"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

type InitialMessage = { id: string; role: "user" | "assistant"; content: string };

export function AssistantChat({ initialMessages }: { initialMessages: InitialMessage[] }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
    initialMessages,
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="panel flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="text-sm text-muted">
            Спросите про свои цели, задачи, привычки — или попросите что-то создать. Например:
            «Какие у меня незакрытые задачи на сегодня?» или «Создай цель: прочитать 12 книг в этом
            году, дедлайн 31 декабря».
          </p>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl2 px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-brand-gradient text-white"
                  : "panel-soft"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Написать ассистенту..."
          className="input flex-1"
        />
        <button type="submit" disabled={isLoading} className="btn-primary shrink-0">
          {isLoading ? "..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}
