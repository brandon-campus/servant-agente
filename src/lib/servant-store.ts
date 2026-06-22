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
  reparar: "En Servant somos expertos en reparación Apple. Presupuestamos en el acto. Trabajamos con pantallas originales y baterías certificadas. Garantía de 90 días en todas las reparaciones.",
  comprar: "Vendemos equipos Apple nuevos y reacondicionados con garantía. Tomamos tu celu usado como forma de pago. Financiación disponible.",
  cursos_presenciales: "Cursos presenciales en Av. Corrientes 3621, Almagro, Buenos Aires. Niveles inicial, intermedio y avanzado. Puestos completamente equipados con herramientas profesionales.",
  cursos_online: "Cursos online en 4K. Acceso de por vida al material. Comunidad privada de alumnos. Certificado al finalizar.",
  maquinas: "Distribuidores oficiales de las mejores marcas para técnicos. Máquinas de soldar, microscopios, fuentes reguladas, estaciones de aire caliente y más.",
  repuestos: "Distribuidores oficiales de Mobilesentrix en Argentina. Repuestos originales y compatibles para todas las marcas. Envíos a todo el país.",
  alquilar: "Auditorio para 100 personas, estudio de podcast y estudio fotográfico en Av. Corrientes 3621. Ideal para eventos, grabaciones y presentaciones.",
};

const initial: AppState = {
  conversations: {
    "u1": {
      id: "u1", area: "Cursos presenciales", status: "in_human",
      createdAt: Date.now() - 1000 * 60 * 8, updatedAt: Date.now() - 1000 * 60 * 8,
      messages: [
        { id: "m1", sender: "bot", text: "¡Hola! 👋 Soy el asistente de Servant Argentina.\n¿En qué te puedo ayudar hoy?", ts: Date.now() - 1000 * 60 * 10 },
        { id: "m2", sender: "user", text: "Cursos presenciales", ts: Date.now() - 1000 * 60 * 9 },
        { id: "m3", sender: "user", text: "Quiero anotarme al próximo curso", ts: Date.now() - 1000 * 60 * 8 },
      ],
    },
    "u2": {
      id: "u2", area: "Repuestos por mayor", status: "resolved",
      createdAt: Date.now() - 1000 * 60 * 60, updatedAt: Date.now() - 1000 * 60 * 60,
      messages: [
        { id: "m1", sender: "user", text: "Repuestos por mayor", ts: Date.now() - 1000 * 60 * 65 },
        { id: "m2", sender: "leila", text: "¡Hola! Te paso el catálogo por mail.", ts: Date.now() - 1000 * 60 * 60 },
      ],
    },
  },
  leilaOnline: true,
  config: {
    agentName: "Asistente Servant",
    welcome: "¡Hola! 👋 Soy el asistente de Servant Argentina.\n¿En qué te puedo ayudar hoy?",
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

