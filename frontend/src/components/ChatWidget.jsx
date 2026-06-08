import { useState } from "react";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      { text: message, sender: "user" }
    ]);

    setMessage("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "#6366f1",
          color: "white",
          fontSize: "24px",
          cursor: "pointer"
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            background: "white",
            borderRadius: "15px",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              background: "#6366f1",
              color: "white",
              padding: "15px",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px"
            }}
          >
            ResumePilot AI
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign:
                    msg.sender === "user"
                      ? "right"
                      : "left",
                  marginBottom: "10px"
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              padding: "10px"
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px"
              }}
            />

            <button
              onClick={handleSend}
              style={{
                marginLeft: "10px",
                padding: "10px",
                background: "#6366f1",
                color: "white",
                border: "none"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;