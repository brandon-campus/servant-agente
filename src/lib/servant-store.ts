// Shared store for agent <-> admin communication, persisted in localStorage
// so messages sync across tabs/views via the `storage` event.

export type Sender = "bot" | "user" | "leila";
export type ConversationStatus = "active" | "pending_human" | "in_human" | "resolved";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  ts: number;
}

export interface Conversation {
  id: string;
  area: string | null;
  status: ConversationStatus;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  conversations: Record<string, Conversation>;
  leilaOnline: boolean;
  config: {
    agentName: string;
    welcome: string;
    agentActive: boolean;
    showLeilaIndicator: boolean;
  };
  content: Record<string, string>; // area key -> manual content
}

const KEY = "servant-state-v1";

const defaultContent: Record<string, string> = {
  reparar: "En Servant somos expertos en reparación Apple 🍎.\n\nTrabajamos con repuestos originales y alternativos AAA. Presupuestamos en el acto.\n\n💳 3 y 6 cuotas sin interés.\n🛡️ Garantía escrita de 90 días.\n\nDecime, ¿qué problema tiene tu equipo o qué modelo es?",
  comprar: "¡Excelente decisión! Vendemos equipos Apple nuevos (en caja sellada) y reacondicionados (A+) con garantía.\n\n🔄 Tomamos tu celular usado como parte de pago.\n🚚 Envíos gratis a todo el país.\n\n¿Buscás algún modelo de iPhone en particular?",
  cursos_presenciales: "Nuestros cursos presenciales se dictan en Av. Corrientes 3621, Almagro, CABA.\n\n🛠️ Puestos equipados con herramientas nivel profesional.\n👨‍🏫 Profesores técnicos activos en el rubro.\n\nContamos con niveles Inicial, Intermedio y Microelectrónica. ¿Qué nivel buscabas?",
  cursos_online: "La modalidad online incluye acceso de por vida a nuestra plataforma, clases grabadas en 4K y soporte directo de los profesores en foros privados.\n\nPodés empezar hoy mismo. ¿Te interesa el temario?",
  maquinas: "Somos distribuidores oficiales de las mejores marcas para técnicos (Sugon, Quick, Mechanic, Yihua).\n\nVendemos estaciones de soldado, microscopios trinoculares, fuentes y mucho más. ¿Qué necesitás para equipar tu taller?",
  repuestos: "Somos representantes oficiales de Mobilesentrix en Argentina. 📦\n\nVendemos repuestos originales (AmpSentrix) y alternativos de alta calidad para iPhone y otras marcas, directo a gremio.\n\n¿Querés que te pasemos la lista de precios mayorista?",
  alquilar: "Contamos con instalaciones de primer nivel en Almagro:\n\n🎙️ Estudio de Podcast profesional.\n📸 Estudio fotográfico / Set de streaming.\n👥 Auditorio para 100 personas.\n\n¿Para qué tipo de evento o proyecto buscás espacio?",
};

const initial: AppState = {
  conversations: {
    "u1": {
      id: "u1", area: "Reparar mi celu", status: "pending_human",
      createdAt: Date.now() - 1000 * 60 * 15, updatedAt: Date.now() - 1000 * 60 * 10,
      messages: [
        { id: "m1", sender: "bot", text: "¡Hola! 👋 Soy el asistente de Servant Argentina.\n¿En qué te puedo ayudar hoy?", ts: Date.now() - 1000 * 60 * 15 },
        { id: "m2", sender: "user", text: "🔧 Reparar mi celu", ts: Date.now() - 1000 * 60 * 14 },
        { id: "m3", sender: "bot", text: defaultContent.reparar, ts: Date.now() - 1000 * 60 * 14 + 1000 },
        { id: "m4", sender: "user", text: "Tengo un iPhone 13, se me rompió el módulo. Cuánto sale?", ts: Date.now() - 1000 * 60 * 12 },
        { id: "m5", sender: "bot", text: "¡Genial! Para coordinar esto con vos necesito que te contacte una persona de nuestro equipo 🙌\n\nYa le avisé a Leila. En breve te va a atender por acá mismo.\n⏳ Esperá unos minutos...", ts: Date.now() - 1000 * 60 * 11 },
      ],
    },
    "u2": {
      id: "u2", area: "Cursos presenciales", status: "pending_human",
      createdAt: Date.now() - 1000 * 60 * 30, updatedAt: Date.now() - 1000 * 60 * 25,
      messages: [
        { id: "m1", sender: "user", text: "🎓 Cursos presenciales", ts: Date.now() - 1000 * 60 * 30 },
        { id: "m2", sender: "bot", text: defaultContent.cursos_presenciales, ts: Date.now() - 1000 * 60 * 29 },
        { id: "m3", sender: "user", text: "Nivel inicial por favor. Quiero anotarme a la proxima camada", ts: Date.now() - 1000 * 60 * 26 },
        { id: "m4", sender: "bot", text: "¡Genial! Para coordinar esto con vos necesito que te contacte una persona de nuestro equipo 🙌\n\nYa le avisé a Leila. En breve te va a atender por acá mismo.\n⏳ Esperá unos minutos...", ts: Date.now() - 1000 * 60 * 25 },
      ],
    },
    "u3": {
      id: "u3", area: "Repuestos por mayor", status: "resolved",
      createdAt: Date.now() - 1000 * 60 * 120, updatedAt: Date.now() - 1000 * 60 * 90,
      messages: [
        { id: "m1", sender: "user", text: "📦 Repuestos por mayor", ts: Date.now() - 1000 * 60 * 120 },
        { id: "m2", sender: "bot", text: defaultContent.repuestos, ts: Date.now() - 1000 * 60 * 119 },
        { id: "m3", sender: "user", text: "Si, soy de Cordoba me pasas el PDF?", ts: Date.now() - 1000 * 60 * 110 },
        { id: "m4", sender: "leila", text: "¡Hola! Claro, acá tenés el link para descargar el catálogo mayorista de este mes: servant-repuestos.pdf", ts: Date.now() - 1000 * 60 * 105 },
        { id: "m5", sender: "user", text: "Gracias Leila, te escribo por wsp despues.", ts: Date.now() - 1000 * 60 * 90 },
      ],
    },
    "u4": {
      id: "u4", area: "Máquinas y herramientas", status: "active",
      createdAt: Date.now() - 1000 * 60 * 2, updatedAt: Date.now() - 1000 * 60 * 1,
      messages: [
        { id: "m1", sender: "bot", text: "¡Hola! 👋 Soy el asistente de Servant Argentina.\n¿En qué te puedo ayudar hoy?", ts: Date.now() - 1000 * 60 * 2 },
        { id: "m2", sender: "user", text: "🔩 Máquinas y herramientas", ts: Date.now() - 1000 * 60 * 1 },
        { id: "m3", sender: "bot", text: defaultContent.maquinas, ts: Date.now() - 1000 * 60 * 1 + 1000 },
      ],
    },
  },
  leilaOnline: true,
  config: {
    agentName: "Servant IA",
    welcome: "¡Hola! 👋 Soy el asistente de Servant Argentina.\nTenemos varias áreas para ayudarte. ¿Qué estabas buscando hoy?",
    agentActive: true,
    showLeilaIndicator: true,
  },
  content: defaultContent,
};

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

let state: AppState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try { state = JSON.parse(e.newValue); listeners.forEach((l) => l()); } catch {}
    }
  });
}

function save() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
}

export const store = {
  getState: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setState(updater: (s: AppState) => AppState) {
    state = updater(state);
    save();
    listeners.forEach((l) => l());
  },
};

export function addMessage(convoId: string, msg: Omit<ChatMessage, "id" | "ts">) {
  store.setState((s) => {
    const c = s.conversations[convoId];
    if (!c) return s;
    const newMsg: ChatMessage = { ...msg, id: Math.random().toString(36).slice(2), ts: Date.now() };
    return {
      ...s,
      conversations: {
        ...s.conversations,
        [convoId]: { ...c, messages: [...c.messages, newMsg], updatedAt: Date.now() },
      },
    };
  });
}

export function createConversation(id: string): void {
  store.setState((s) => {
    if (s.conversations[id]) return s;
    return {
      ...s,
      conversations: {
        ...s.conversations,
        [id]: { id, area: null, status: "active", messages: [], createdAt: Date.now(), updatedAt: Date.now() },
      },
    };
  });
}

export function updateConversation(id: string, patch: Partial<Conversation>) {
  store.setState((s) => {
    const c = s.conversations[id];
    if (!c) return s;
    return { ...s, conversations: { ...s.conversations, [id]: { ...c, ...patch, updatedAt: Date.now() } } };
  });
}

import { useEffect, useState, useSyncExternalStore } from "react";
export function useStore<T>(selector: (s: AppState) => T): T {
  const [, setReady] = useState(false);
  useEffect(() => { ensureHydrated(); setReady(true); }, []);
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => selector(state),
    () => selector(initial),
  );
}

