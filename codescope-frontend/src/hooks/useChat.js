import { useEffect, useState } from "react";
import { askQuestion } from "../api/codescopeApi";

function createChat() {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    title: "New chat",
    messages: [],
    updatedAt: Date.now(),
  };
}

export function useChat(repositoryId) {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const chat = createChat();

    setChats([chat]);
    setCurrentChatId(chat.id);
    setLoading(false);
    setError("");
  }, [repositoryId]);

  const currentChat =
    chats.find(
      (chat) => chat.id === currentChatId
    ) ||
    chats[0] ||
    null;

  const messages = currentChat?.messages || [];

  const updateChat = (chatId, updater) => {
    setChats((items) =>
      items.map((chat) =>
        chat.id === chatId
          ? {
              ...updater(chat),
              updatedAt: Date.now(),
            }
          : chat
      )
    );
  };

  const newChat = () => {
    const chat = createChat();

    setChats((items) => [
      chat,
      ...items,
    ]);

    setCurrentChatId(chat.id);
    setError("");
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
    setError("");
  };

  const sendQuestion = async (question) => {
    if (
      !question.trim() ||
      loading ||
      !currentChat
    ) {
      return;
    }

    const trimmedQuestion =
      question.trim();

    const chatId = currentChat.id;
    const currentMessages =
      currentChat.messages;

    const history =
      currentMessages.map((message) => ({
        question:
          message.role === "user"
            ? message.content
            : "",
        answer:
          message.role === "assistant"
            ? message.content
            : "",
      }));

    updateChat(chatId, (chat) => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? trimmedQuestion.slice(0, 45) +
            (
              trimmedQuestion.length > 45
                ? "..."
                : ""
            )
          : chat.title,
      messages: [
        ...chat.messages,
        {
          role: "user",
          content: trimmedQuestion,
        },
      ],
    }));

    setLoading(true);
    setError("");

    try {
      const result = await askQuestion(
        repositoryId,
        trimmedQuestion,
        history
      );

      updateChat(chatId, (chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            role: "assistant",
            content:
              result?.answer ||
              result?.response ||
              "No answer returned.",
            sources:
              result?.sources || [],
          },
        ],
      }));

      setChats((items) =>
        [...items].sort(
          (a, b) =>
            b.updatedAt -
            a.updatedAt
        )
      );

      return result;

    } catch (err) {
      setError(err.message);

      updateChat(
        chatId,
        (chat) => ({
          ...chat,
          messages: [
            ...chat.messages,
            {
              role: "assistant",
              content: `Unable to answer right now: ${err.message}`,
            },
          ],
        })
      );

    } finally {
      setLoading(false);
    }
  };

  return {
    chats,
    currentChatId,
    messages,
    loading,
    error,
    sendQuestion,
    newChat,
    selectChat,
  };
}