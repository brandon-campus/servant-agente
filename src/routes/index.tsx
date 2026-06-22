import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Wrench, Smartphone, GraduationCap, Laptop, Hammer, Package, Mic, SendHorizontal, Bot, Menu, Plus } from "lucide-react";
import {
  addMessage,
  createConversation,
  updateConversation,
  useStore,
  store,
  type ChatMessage,
} from "@/lib/servant-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Servant Argentina · Asistente" },
      { name: "description", content: "Asistente de Servant Argentina — expertos en Apple y reparación de celulares." },
    ],
  }),
  component: AgentView,
});

const AREAS = [
  { key: "reparar", label: "Reparar mi celu", icon: Wrench },
  { key: "comprar", label: "Comprar un celu", icon: Smartphone },
  { key: "cursos_presenciales", label: "Cursos presenciales", icon: GraduationCap },
  { key: "cursos_online", label: "Cursos online", icon: Laptop },
  { key: "maquinas", label: "Máquinas y herramientas", icon: Hammer },
  { key: "repuestos", label: "Repuestos por mayor", icon: Package },
  { key: "alquilar", label: "Alquilar espacios", icon: Mic },
];

const HANDOFF_KEYWORDS = [
  "quiero", "me interesa", "como compro", "cómo compro", "cuanto sale", "cuánto sale",
  "reservar", "me anoto", "anotarme", "turno", "comprar", "precio", "presupuesto",
  "agendar", "coordinar",
];

function genId() {
  let id = sessionStorage.getItem("servant-convo-id");
  if (!id) {
    const n = Math.floor(Math.random() * 900 + 100);
    id = `u${n}`;
    sessionStorage.setItem("servant-convo-id", id);
  }
  return id;
}

function AgentView() {
  const [convoId, setConvoId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conversation = useStore((s) => (convoId ? s.conversations[convoId] : null));
  const leilaOnline = useStore((s) => s.leilaOnline);
  const showLeila = useStore((s) => s.config.showLeilaIndicator);
  const welcome = useStore((s) => s.config.welcome);

  useEffect(() => {
    const id = genId();
    createConversation(id);
    setConvoId(id);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length, botTyping]);

  function resetChat() {
    const id = `u${Math.floor(Math.random() * 900 + 100)}`;
    sessionStorage.setItem("servant-convo-id", id);
    createConversation(id);
    setConvoId(id);
    setSidebarOpen(false);
  }

  function pickArea(area: typeof AREAS[number]) {
    if (!convoId) return;
    setSidebarOpen(false);
    addMessage(convoId, { sender: "user", text: area.label });
    updateConversation(convoId, { area: area.label });
    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      const content = store.getState().content;
      addMessage(convoId, { sender: "bot", text: content[area.key] || "¡Entendido!" });
    }, 1000);
  }

  function send() {
    if (!convoId || !input.trim() || botTyping) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    addMessage(convoId, { sender: "user", text });

    const c = conversation;
    if (!c) return;
    if (c.status === "pending_human" || c.status === "in_human") return;

    const lower = text.toLowerCase();
    const wantsHandoff = HANDOFF_KEYWORDS.some((k) => lower.includes(k));

    if (wantsHandoff) {
      setBotTyping(true);
      setTimeout(() => {
        setBotTyping(false);
        addMessage(convoId, {
          sender: "bot",
          text: "¡Genial! Para coordinar esto con vos necesito que te contacte una persona de nuestro equipo 🙌\n\nYa le avisé a Leila. En breve te va a atender por acá mismo.\n⏳ Esperá unos minutos...",
        });
        updateConversation(convoId, { status: "pending_human" });
      }, 1000);
    } else {
      setBotTyping(true);
      setTimeout(() => {
        setBotTyping(false);
        addMessage(convoId, {
          sender: "bot",
          text: "Tomé nota. ¿Querés que te derive con una persona del equipo para avanzar? Decime \"quiero coordinar\" y te conecto con Leila.",
        });
      }, 900);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isChatStarted = !!(conversation && conversation.messages.length > 0);
  const showLeilaStatus = showLeila && conversation &&
    (conversation.status === "pending_human" || conversation.status === "in_human");

  return (
    <div className="agent-layout">
      {/* Backdrop */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`agent-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="agent-sidebar-header">
          <button className="new-chat-btn" onClick={resetChat}>
            <Plus size={16} />
            Nuevo chat
          </button>
        </div>
        <div className="agent-sidebar-nav">
          <div className="agent-sidebar-nav-title">Áreas de servicio</div>
          {AREAS.map((a) => (
            <button key={a.key} className="agent-nav-item" onClick={() => pickArea(a)}>
              <a.icon size={15} />
              {a.label}
            </button>
          ))}
        </div>
        <div className="agent-sidebar-footer">
          <div className="avatar-sm" style={{ width: 32, height: 32, fontSize: 13 }}>U</div>
          Cliente Visitante
        </div>
      </aside>

      {/* Main */}
      <main className="agent-main">
        {/* Mobile header */}
        <div className="agent-mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <Bot size={18} style={{ color: "var(--servant-yellow)" }} />
          <span>SERVANT</span>
        </div>

        {/* Scroll area */}
        <div className="agent-scroll-area" ref={bodyRef}>
          {!isChatStarted ? (
            /* START SCREEN */
            <div className="agent-start-screen">
              <div className="agent-start-bot-icon">
                <Bot size={52} />
              </div>
              <h1>{welcome || "¡Hola! ¿En qué te puedo ayudar hoy?"}</h1>

              <div className="agent-input-box">
                <form
                  className="agent-input-form"
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                >
                  <textarea
                    ref={textareaRef}
                    className="agent-textarea"
                    placeholder="Escribí tu consulta..."
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={botTyping}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="agent-send-btn"
                    disabled={botTyping || !input.trim()}
                    aria-label="Enviar"
                  >
                    <SendHorizontal size={20} />
                  </button>
                </form>

                <div className="agent-pills">
                  {AREAS.map((a) => (
                    <button key={a.key} className="agent-pill" onClick={() => pickArea(a)}>
                      <a.icon size={14} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CHAT MESSAGES */
            <div className="agent-messages">
              {conversation.messages.map((m) => (
                <ClaudeBubble key={m.id} m={m} />
              ))}

              {botTyping && (
                <div className="agent-typing">
                  <div className="msg-bot-avatar">
                    <Bot size={15} />
                  </div>
                  <div className="agent-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {showLeilaStatus && (
                <div className="agent-leila-status">
                  <span className={`agent-leila-dot${leilaOnline ? "" : " off"}`} />
                  Leila {leilaOnline ? "está disponible" : "no está disponible ahora"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat footer (only in chat mode) */}
        {isChatStarted && (
          <div className="agent-chat-footer">
            <div className="agent-input-box">
              <form
                className="agent-input-form"
                onSubmit={(e) => { e.preventDefault(); send(); }}
              >
                <textarea
                  ref={textareaRef}
                  className="agent-textarea"
                  placeholder="Escribí tu consulta..."
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={botTyping}
                  autoFocus
                />
                <button
                  type="submit"
                  className="agent-send-btn"
                  disabled={botTyping || !input.trim()}
                  aria-label="Enviar"
                >
                  <SendHorizontal size={20} />
                </button>
              </form>
              <p className="agent-footer-hint">
                Servant IA puede cometer errores. Considerá verificar la información importante.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ClaudeBubble({ m }: { m: ChatMessage }) {
  if (m.sender === "user") {
    return (
      <div className="msg-user">
        <div className="msg-user-bubble">{m.text}</div>
      </div>
    );
  }

  return (
    <div className="msg-bot">
      <div className="msg-bot-avatar">
        {m.sender === "leila" ? "L" : <Bot size={15} />}
      </div>
      <div className="msg-bot-content">
        {m.sender === "leila" && (
          <div className="msg-bot-author">Leila · Servant</div>
        )}
        <div className="msg-bot-text">{m.text}</div>
      </div>
    </div>
  );
}
