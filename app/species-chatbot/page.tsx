/* eslint-disable */
"use client";

import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function SpeciesChatbot() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // STEP 8: Send the user's message to /api/chat
  const handleSubmit = async () => {
    const trimmedMessage = message.trim();

    // Don't send empty messages or another message while waiting
    if (!trimmedMessage || loading) {
      return;
    }

    // Create the user's chat message
    const userMessage: Message = {
      role: "user",
      content: trimmedMessage,
    };

    // Add user's message to the chat
    setChatLog((previousChatLog) => [
      ...previousChatLog,
      userMessage,
    ]);

    // Clear input box
    setMessage("");

    // Disable input while waiting for Gemini
    setLoading(true);

    try {
      // Send message to our API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      // Read response from /api/chat
      const data = (await response.json()) as {
        response?: string;
        error?: string;
      };

      // If API returned an error
      if (!response.ok) {
        throw new Error(
          data.error ?? data.response ?? "Request failed."
        );
      }

      // Create bot message
      const botMessage: Message = {
        role: "bot",
        content:
          data.response ??
          "Sorry, I couldn't generate a response.",
      };

      // Add bot response to chat
      setChatLog((previousChatLog) => [
        ...previousChatLog,
        botMessage,
      ]);
    } catch (error) {
      console.error(error);

      // Show safe fallback message
      setChatLog((previousChatLog) => [
        ...previousChatLog,
        {
          role: "bot",
          content:
            "Sorry, I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      // Re-enable input
      setLoading(false);
    }
  };

  return (
    <>
      <TypographyH2>Species Chatbot</TypographyH2>

      <div className="mt-4 flex gap-4">
        <div className="mt-4 rounded-lg bg-foreground p-4 text-background">
          <TypographyP>
            The Species Chatbot is a feature specialized to answer
            questions about animals. It can provide information on
            various species, including their habitat, diet,
            conservation status, and other relevant details. Any
            unrelated prompts will return a message indicating that
            the chatbot is specialized for species-related queries
            only.
          </TypographyP>

          <TypographyP>
            To use the Species Chatbot, simply type your question in
            the input field below and hit enter. The chatbot will
            respond with the best available information.
          </TypographyP>
        </div>
      </div>

      <div className="mx-auto mt-6">
        {/* Chat history */}
        <div className="h-[400px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted p-4">
          {chatLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Start chatting about a species!
            </p>
          ) : (
            chatLog.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none border border-border bg-foreground text-primary-foreground"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Textarea and submission */}
        <div className="mt-4 flex flex-col items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
            rows={1}
            placeholder="Ask about a species..."
            disabled={loading}
            className="w-full resize-none overflow-hidden rounded border border-border bg-background p-2 text-sm text-foreground focus:outline-none disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading || message.trim() === ""}
            className="mt-2 rounded bg-primary px-4 py-2 text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Enter"}
          </button>
        </div>
      </div>
    </>
  );
}