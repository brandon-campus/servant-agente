import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logoAsset from "@/assets/servant-logo.png.asset.json";
import {
  addMessage,
  createConversation,
  updateConversation,
  useStore,
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
  { key: "reparar", label: "🔧 Reparar mi celu" },
  { key: "comprar", label: "📱 Comprar un celu" },
  { key: "cursos_presenciales", label: "🎓 Cursos presenciales" },
  { key: "cursos_online", label: "💻 Cursos online" },
  { key: "maquinas", label: "🔩 Máquinas y herramientas" },
  { key: "repuestos", label: "📦 Repuestos por mayor" },
  { key: "alquilar", label: "🎙️ Alquilar espacios" },
];

const AREA_RESPONSES: Record<string, string> = {
  reparar: "¡Perfecto! En Servant somos expertos en reparación Apple 🍎\nPresupuestamos tu reparación en el acto.\n\n¿Qué problema tiene tu dispositivo? Por ejemplo:\npantalla rota, batería, cámara, botones, o no enciende.",
  comprar: "¡Genial! Tenemos equipos Apple disponibles 📱\nAdemás, tomamos tu celu usado como forma de pago.\n\n¿Tenés algún modelo en mente o querés que te ayude a elegir según tu presupuesto?",
  cursos_presenciales: "¡Excelente decisión! 🎓 Nuestros cursos presenciales son en Av. Corrientes 3621, Almagro, Buenos Aires.\n\nTenemos cursos para todos los niveles con puestos completamente equipados.\n\n¿Sos principiante o ya tenés experiencia en reparación de celulares?",
  cursos_online: "💻 Nuestros cursos online son en definición 4K para que no te pierdas ningún detalle.\n\nPodés aprender a tu ritmo desde cualquier lugar del país.\n\n¿Querés información sobre algún curso en particular o preferís que te cuente las opciones disponibles?",
  maquinas: "🔩 Somos distribuidores de las mejores herramientas para técnicos.\nTenemos todo lo que necesitás para equipar tu taller.\n\n¿Buscás alguna herramienta en particular o querés ver el catálogo completo?",
  repuestos: "📦 Somos distribuidores oficiales de Mobilesentrix en todo el país.\n\n¿Ya sos distribuidor o querés serlo? ¿O buscás comprar repuestos para tu taller?",
  alquilar: "🎙️ Nuestro espacio está en Av. Corrientes 3621, Almagro — con auditorio para 100 personas, estudio de podcast y estudio fotográfico.\n\n¿Para qué tipo de evento o grabación necesitás el espacio?",
};

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
  const [showAreas, setShowAreas] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const conversation = useStore((s) => (convoId ? s.conversations[convoId] : null));
  const leilaOnline = useStore((s) => s.leilaOnline);
  const showLeila = useStore((s) => s.config.showLeilaIndicator);
  const welcome = useStore((s) => s.config.welcome);
  const agentName = useStore((s) => s.config.agentName);

  // Init conversation once on mount
  useEffect(() => {
    const id = genId();
    createConversation(id);
    setConvoId(id);
  }, []);

  // Welcome flow
  useEffect(() => {
    if (!convoId || welcomeDone || !conversation) return;
    if (conversation.messages.length > 0) {
      setWelcomeDone(true);
      // If past welcome already triggered area selection, hide area buttons
      if (conversation.area) setShowAreas(false);
      else setShowAreas(true);
      return;
    }
    setWelcomeDone(true);
    setBotTyping(true);
    const t1 = setTimeout(() => {
      setBotTyping(false);
      addMessage(convoId, { sender: "bot", text: welcome });
      setTimeout(() => setShowAreas(true), 400);
    }, 800);
    return () => clearTimeout(t1);
  }, [convoId, welcomeDone, conversation, welcome]);

  // Auto scroll
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length, botTyping, showAreas]);

  function pickArea(area: typeof AREAS[number]) {
    if (!convoId) return;
    setShowAreas(false);
    addMessage(convoId, { sender: "user", text: area.label });
    updateConversation(convoId, { area: area.label });
    setBotTyping(true);
    setTimeout(() => {
      setBotTyping(false);
      addMessage(convoId, { sender: "bot", text: AREA_RESPONSES[area.key] });
    }, 1000);
  }

  function send() {
    if (!convoId || !input.trim() || botTyping) return;
    const text = input.trim();
    setInput("");
    addMessage(convoId, { sender: "user", text });

    const c = conversation;
    if (!c) return;

    // If already in human stage, don't auto-respond
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

  const inputDisabled = botTyping;
  const showLeilaStatus = showLeila && conversation && (conversation.status === "pending_human" || conversation.status === "in_human");

  return (
    <div className="chat-wrap">
      <div className="chat-app">
        <header className="chat-header">
          <img src={logoAsset.url} alt="Servant" />
          <div>
            <h1>{agentName.toUpperCase()}</h1>
            <p>Expertos en Apple · Argentina</p>
          </div>
        </header>

        <div className="chat-body" ref={bodyRef}>
          {conversation?.messages.map((m) => <Bubble key={m.id} m={m} />)}
          {botTyping && (
            <div className="typing"><span /><span /><span /></div>
          )}
          {showAreas && !botTyping && (
            <div className="area-buttons">
              {AREAS.map((a) => (
                <button key={a.key} className="area-btn" onClick={() => pickArea(a)}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {showLeilaStatus && (
            <div className="leila-status">
              <span className={`leila-dot ${leilaOnline ? "" : "off"}`} />
              Leila {leilaOnline ? "está disponible" : "no está disponible ahora"}
            </div>
          )}
        </div>

        <form
          className="chat-footer"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            className="chat-input"
            placeholder="Escribí tu consulta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={inputDisabled}
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={inputDisabled || !input.trim()} aria-label="Enviar">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: ChatMessage }) {
  if (m.sender === "user") {
    return <div className="bubble user">{m.text}</div>;
  }
  return (
    <div className="bubble bot">
      {m.sender === "leila" && <div className="bubble-author">Leila · Servant</div>}
      {m.text}
    </div>
  );
}
