import useSWR from "swr";
import { fetcher } from "./fetcher";

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function useChats() {
  const { data, error, mutate } = useSWR<{ chats: Chat[] }>(
    "/api/chats",
    fetcher
  );
  return {
    chats: data?.chats,
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  };
}

export function useChatMessages(chatId: string) {
  const shouldFetch = !!chatId;
  const { data, error, mutate } = useSWR<{ messages: Message[] }>(
    shouldFetch ? `/api/chats/${chatId}` : null,
    fetcher
  );
  return {
    messages: data?.messages,
    isLoading: shouldFetch && !error && !data,
    isError: !!error,
    mutate,
  };
}
