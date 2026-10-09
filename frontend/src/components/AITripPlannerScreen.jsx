import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import {
  Sparkles,
  Send,
  MapPin,
  Compass,
  MessageCircle,
  Bot,
  RotateCw
} from 'lucide-react';

let messageSeq = 1;

const nextMessageId = () => {
  messageSeq += 1;
  return messageSeq;
};

// Simple markdown renderer for **bold** text
const renderMarkdown = (text) => {
  const parts = text.split('**');

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }

    return part;
  });
};

const AITripPlannerScreen = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI travel assistant. Where would you like to go in Pakistan?",
      sender: 'ai'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    Promise.resolve().then(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText) => {
    const messageText = String(
      overrideText !== undefined ? overrideText : inputValue
    ).trim();

    if (!messageText || isLoading) return;

    const userMessage = {
      id: nextMessageId(),
      text: messageText,
      sender: 'user'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/trip-planner', {
        method: 'POST',
        body: {
          message: messageText
        }
      });

      const aiMessage = {
        id: nextMessageId(),
        text: data.message,
        sender: 'ai',
        recommendedPackages: data.recommendedPackages || []
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorMessage = {
        id: nextMessageId(),
        text:
          error?.message ||
          "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        sender: 'ai',
        isError: true,
        retryPrompt: messageText
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (prompt) => {
    if (isLoading || !prompt) return;

    setMessages((prev) =>
      prev.filter((msg) => !(msg.isError && msg.retryPrompt === prompt))
    );

    await handleSend(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] pb-32">

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[color:var(--border-light)] bg-[color:var(--bg-primary)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-sm)]">
            <Sparkles size={21} strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-lg text-[color:var(--text-primary)]">
              AI Trip Planner
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />

              <span className="text-xs font-medium text-[color:var(--text-muted)]">
                Your Pakistan travel assistant
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="mx-auto max-w-4xl overflow-y-auto px-4 py-6"
        style={{
          maxHeight: 'calc(100vh - 190px)'
        }}
      >

        {/* Intro */}
        {messages.length === 1 && (
          <div className="mb-7">

            <div className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 shadow-[var(--shadow-sm)]">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-primary)]">
                  <Compass size={24} />
                </div>

                <div>
                  <h2 className="text-base text-[color:var(--text-primary)]">
                    Plan your next journey
                  </h2>

                  <p className="text-sm text-[color:var(--text-secondary)]">
                    Tell me what kind of trip you have in mind.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-2xl bg-[color:var(--bg-secondary)] p-4">
                  <MapPin
                    size={18}
                    className="mb-2 text-[color:var(--brand-primary)]"
                  />

                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Destination
                  </p>

                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Where do you want to go?
                  </p>
                </div>

                <div className="rounded-2xl bg-[color:var(--bg-secondary)] p-4">
                  <Compass
                    size={18}
                    className="mb-2 text-[color:var(--brand-primary)]"
                  />

                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Experience
                  </p>

                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Adventure, culture or relaxation?
                  </p>
                </div>

                <div className="rounded-2xl bg-[color:var(--bg-secondary)] p-4">
                  <Sparkles
                    size={18}
                    className="mb-2 text-[color:var(--brand-primary)]"
                  />

                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Preferences
                  </p>

                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Budget, duration and interests.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Messages */}
        <div className="space-y-5">

          {messages.map((msg) => {

            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >

                {!isUser && (
                  <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary)] text-white">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] ${
                    isUser
                      ? 'rounded-[22px] rounded-br-md bg-[color:var(--brand-primary)] px-4 py-3 text-white shadow-[var(--shadow-sm)]'
                      : 'rounded-[22px] rounded-bl-md border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-4 py-3 text-[color:var(--text-primary)] shadow-[var(--shadow-xs)]'
                  }`}
                >

                  <div className="whitespace-pre-wrap text-sm leading-6">
                    {renderMarkdown(msg.text)}
                  </div>

                  {msg.isError && msg.retryPrompt && (
                    <button
                      type="button"
                      onClick={() => handleRetry(msg.retryPrompt)}
                      disabled={isLoading}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-primary)] bg-[color:var(--bg-secondary)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-primary)] transition hover:bg-[color:var(--brand-gold-soft)] disabled:opacity-50"
                    >
                      <RotateCw size={13} strokeWidth={2.2} />
                      Try again
                    </button>
                  )}

                  {msg.recommendedPackages &&
                    msg.recommendedPackages.length > 0 && (
                      <div className="mt-4 border-t border-[color:var(--border-light)] pt-4">

                        <p className="mb-2 text-sm font-bold text-[color:var(--text-primary)]">
                          Recommended packages
                        </p>

                        <div className="space-y-2">

                          {msg.recommendedPackages.map(
                            (pkg, idx) => (
                              <button
                                type="button"
                                key={pkg.id || idx}
                                onClick={() =>
                                  pkg.id &&
                                  navigate(`/package/${pkg.id}`)
                                }
                                className="w-full text-left rounded-xl bg-[color:var(--bg-secondary)] p-3 transition hover:bg-[color:var(--brand-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand-primary)]"
                              >
                                <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                                  {pkg.title}
                                </p>

                                {pkg.description && (
                                  <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
                                    {pkg.description}
                                  </p>
                                )}

                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold text-[color:var(--brand-primary)]">
                                    PKR {Number(pkg.price).toLocaleString()}
                                  </p>

                                  {pkg.duration_days && (
                                    <span className="text-[11px] font-medium text-[color:var(--text-muted)]">
                                      {pkg.duration_days} days
                                    </span>
                                  )}
                                </div>
                              </button>
                            )
                          )}

                        </div>
                      </div>
                    )}

                </div>
              </div>
            );
          })}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-end gap-2.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary)] text-white">
                <Bot size={16} />
              </div>

              <div className="rounded-[22px] rounded-bl-md border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-4 py-4 shadow-[var(--shadow-xs)]">

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--brand-gold)]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--brand-gold)] [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--brand-gold)] [animation-delay:240ms]" />
                </div>

              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[68px] left-0 right-0 z-40 px-3 pb-3 pt-2 sm:px-4">

        <div className="mx-auto max-w-4xl">

          <div className="rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-1.5 shadow-[var(--shadow-lg)] backdrop-blur-xl">

            <div className="flex items-center gap-1.5">

              <div className="flex min-w-0 flex-1 items-center">

                <MessageCircle
                  size={19}
                  className="ml-3 shrink-0 text-[color:var(--text-muted)]"
                />

                <input
                aria-label="Message the AI trip planner"
                  type="text"
                  value={inputValue}
                  onChange={(e) =>
                    setInputValue(e.target.value)
                  }
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about destinations, activities, budget..."
                  disabled={isLoading}
                  className={`min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] ${
                    isLoading
                      ? 'cursor-not-allowed opacity-50'
                      : ''
                  }`}
                />

              </div>

              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                aria-label="Send message"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] transition-all duration-200 ${
                  isLoading || !inputValue.trim()
                    ? 'cursor-not-allowed bg-[color:var(--bg-secondary)] text-[color:var(--text-muted)]'
                    : 'bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:bg-[color:var(--brand-primary-hover)]'
                }`}
              >
                <Send size={18} strokeWidth={2.2} />
              </button>

            </div>

          </div>

          <p className="mt-2 text-center text-[10px] font-medium text-[color:var(--text-muted)]">
            AI suggestions are for planning purposes. Always verify important travel details.
          </p>

        </div>
      </div>

    </div>
  );
};

export default AITripPlannerScreen;
