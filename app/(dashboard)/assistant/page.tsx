import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getOrCreateConversation } from "@/lib/ai/conversation";
import { PageHeader } from "@/components/PageHeader";
import { AssistantChat } from "./AssistantChat";

export default async function AssistantPage() {
  const userId = await requireUserId();
  const conversation = await getOrCreateConversation(userId, "WEB");

  const messages = await prisma.aiMessage.findMany({
    where: { conversationId: conversation.id, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  const initialMessages = messages.map((m) => ({
    id: m.id,
    role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="mb-4">
        <PageHeader
          icon={Sparkles}
          color="violet"
          title="AI-ассистент"
          subtitle="Может читать и редактировать ваши цели, задачи и привычки прямо в диалоге."
        />
      </div>
      <AssistantChat initialMessages={initialMessages} />
    </div>
  );
}
