import { useEffect, useState } from "react";

export default function ChatTranscript({ events }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const updated = [];
  
    events.forEach((event) => {
        console.log('>>>>>>>.', event);
        const isClient = event.event_id && !event.event_id.startsWith("event_");
  
        // handle user input
        if (isClient && event.type === "conversation.item.create") {
            const content = event.item?.content?.[0]?.text;
            if (content) {
            updated.push({
                role: "user",
                content,
                timestamp: event.timestamp,
            });
            }
        }
  
        // Streaming assistant response
        // if (event.type === "response.audio_transcript.delta") {
        //   const delta = event.delta || "";
        //   if (delta) {
        //     const lastMsg = updated[updated.length - 1];
        //     if (lastMsg && lastMsg.role === "assistant") {
        //       lastMsg.content += delta;
        //     } else {
        //       updated.push({
        //         role: "assistant",
        //         content: delta,
        //         timestamp: event.timestamp,
        //       });
        //     }
        //   }
        // }
        // fallback: catch audio transcripts (e.g., if output_item.done is missing)
        if (
        event.type === "response.audio_transcript.part" ||
        event.type === "response.audio_transcript.done"
      ) {
        const transcript = event.transcript || event.part?.transcript;
        if (transcript) {
            // Add new assistant message
            updated.push({
              role: "assistant",
              content: transcript,
              timestamp: event.timestamp,
            });
          }
        
      }
    });
  
    setMessages(updated);
  }, [events]);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[100vh]">
      {messages.length === 0 ? (
        <div className="text-gray-500">Start the conversation ...</div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl max-w-xl ${
              msg.role === "user"
                ? "bg-blue-100 self-end text-right"
                : "bg-green-100 self-start text-left"
            }`}
          >
            <div className="text-sm text-gray-500 mb-1">
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="text-base text-gray-800 whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
