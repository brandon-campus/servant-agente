import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import logoAsset from "@/assets/servant-logo.png.asset.json";
import {
  addMessage,
  store,
  updateConversation,
  useStore,
} from "@/lib/servant-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Servant Admin" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [logged, setLogged] = useState(false);
  return (
    <>
      <div className="mobile-warn">El dashboard de administración está optimizado para escritorio (mínimo 768px).</div>
      {logged ? <Dashboard onLogout={() => setLogged(false)} /> : <Login onLogin={() => setLogged(true)} />}
    </>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email === "leila@servant.com" && pass === "servant2024") {
      setErr(""); onLogin();
    } else {
      setErr("Credenciales incorrectas.");
    }
  }
  return (
    <div className="admin-login">
      <form className="login-card" onSubmit={submit}>
        <img src={logoAsset.url} alt="Servant" />
        <h2>Servant Admin</h2>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="leila@servant.com" autoFocus />
        </div>
        <div>
          <label>Contraseña</label>
          <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="••••••••" />
        </div>
        {err && <div className="error-msg">{err}</div>}
        <button className="btn-primary" type="submit">Ingresar</button>
        <p style={{ fontSize: 11, color: "var(--servant-text-dim)", textAlign: "center" }}>
          Demo: leila@servant.com / servant2024
        </p>
      </form>
    </div>
  );
}

type Section = "metrics" | "chats" | "content" | "config";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>("metrics");
  const conversations = useStore((s) => s.conversations);

  const pendingCount = useMemo(
    () => Object.values(conversations).filter((c) => c.status === "pending_human").length,
    [conversations]
  );

  // Mark leila online while admin is mounted
  useEffect(() => {
    store.setState((s) => ({ ...s, leilaOnline: true }));
    return () => { store.setState((s) => ({ ...s, leilaOnline: false })); };
  }, []);

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoAsset.url} alt="Servant" />
          <span>SERVANT</span>
        </div>
        <NavItem icon="📊" label="Métricas" active={section === "metrics"} onClick={() => setSection("metrics")} />
        <NavItem icon="💬" label="Chats" active={section === "chats"} onClick={() => setSection("chats")} badge={pendingCount || undefined} />
        <NavItem icon="📝" label="Contenido" active={section === "content"} onClick={() => setSection("content")} />
        <NavItem icon="⚙️" label="Configuración" active={section === "config"} onClick={() => setSection("config")} />
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {section === "metrics" && "Métricas"}
            {section === "chats" && "Chats activos y derivados"}
            {section === "content" && "Contenido por área"}
            {section === "config" && "Configuración"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--servant-text-dim)" }}>Leila · Servant</span>
            <button className="btn-secondary" onClick={onLogout}>Cerrar sesión</button>
          </div>
        </header>
        <div className="admin-content">
          {section === "metrics" && <Metrics />}
          {section === "chats" && <Chats />}
          {section === "content" && <Content />}
          {section === "config" && <Config />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: string; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span>{icon}</span> <span>{label}</span>
      {badge ? <span className="badge">{badge}</span> : null}
    </button>
  );
}

function Metrics() {
  const conversations = useStore((s) => s.conversations);
  const list = Object.values(conversations);
  const pending = list.filter((c) => c.status === "pending_human").length;
  const derived = list.filter((c) => c.status === "pending_human" || c.status === "in_human" || c.status === "resolved").length;
  const total = 24; // hardcoded "consultas hoy"

  const breakdown = [
    { label: "Reparar mi celu", value: 9 },
    { label: "Cursos presenciales", value: 5 },
    { label: "Repuestos por mayor", value: 4 },
    { label: "Comprar un celu", value: 3 },
    { label: "Cursos online", value: 2 },
    { label: "Máquinas y herramientas", value: 1 },
    { label: "Alquilar espacios", value: 0 },
  ];
  const max = Math.max(...breakdown.map((b) => b.value), 1);

  return (
    <>
      <div className="metric-grid">
        <Card label="Consultas hoy" value={total} sub="▲ +18% vs ayer" />
        <Card label="Derivaciones" value={Math.max(derived, 6)} sub="Esta semana" />
        <Card label="Área top" value="Reparación" sub="36% del total" />
        <Card label="En espera" value={pending} sub={pending > 0 ? "🔴 urgente" : "Sin pendientes"} urgent={pending > 0} />
      </div>

      <div className="panel">
        <h2>Consultas por área</h2>
        {breakdown.map((b) => (
          <div className="bar-row" key={b.label}>
            <div>{b.label}</div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(b.value / max) * 100}%` }} /></div>
            <div className="bar-value">{b.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Card({ label, value, sub, urgent }: { label: string; value: string | number; sub: string; urgent?: boolean }) {
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className={`sub ${urgent ? "urgent" : ""}`}>{sub}</div>
    </div>
  );
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function Chats() {
  const conversations = useStore((s) => s.conversations);
  const list = useMemo(() => {
    return Object.values(conversations).sort((a, b) => {
      const order = { pending_human: 0, in_human: 1, active: 2, resolved: 3 } as const;
      const d = order[a.status] - order[b.status];
      if (d !== 0) return d;
      return b.updatedAt - a.updatedAt;
    });
  }, [conversations]);
  const [selected, setSelected] = useState<string | null>(list[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const convo = selected ? conversations[selected] : null;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [convo?.messages.length, selected]);

  function send() {
    if (!convo || !reply.trim()) return;
    addMessage(convo.id, { sender: "leila", text: reply.trim() });
    if (convo.status === "pending_human") updateConversation(convo.id, { status: "in_human" });
    setReply("");
  }

  function resolve() {
    if (!convo) return;
    updateConversation(convo.id, { status: "resolved" });
  }

  return (
    <div className="chat-split">
      <div className="convo-list">
        {list.length === 0 && <div style={{ padding: 20, color: "var(--servant-text-dim)", fontSize: 13 }}>Sin conversaciones aún.</div>}
        {list.map((c) => {
          const cls = c.status === "pending_human" ? "red" : c.status === "in_human" ? "yellow" : c.status === "resolved" ? "green" : "yellow";
          const last = c.messages[c.messages.length - 1];
          return (
            <button key={c.id} className={`convo-item ${selected === c.id ? "active" : ""}`} onClick={() => setSelected(c.id)}>
              <div className="row1">
                <span className={`status-dot ${cls}`} />
                <span>Usuario #{c.id.replace(/^u/, "")}</span>
                <span className="time">{timeAgo(c.updatedAt)}</span>
              </div>
              <div className="row2">
                {c.area ?? "Sin área"} · "{(last?.text ?? "").slice(0, 36)}{(last?.text?.length ?? 0) > 36 ? "..." : ""}"
              </div>
            </button>
          );
        })}
      </div>

      <div className="chat-pane">
        {!convo ? (
          <div className="chat-pane-empty">Seleccioná una conversación</div>
        ) : (
          <>
            <div className="chat-pane-header">
              <div>
                <div style={{ fontWeight: 800 }}>Usuario #{convo.id.replace(/^u/, "")}</div>
                <div style={{ fontSize: 12, color: "var(--servant-text-dim)" }}>{convo.area ?? "Sin área"} · {convo.status}</div>
              </div>
              {convo.status !== "resolved" && (
                <button className="btn-green" onClick={resolve}>Marcar como resuelto</button>
              )}
            </div>
            <div className="chat-pane-body" ref={bodyRef}>
              {convo.messages.map((m) => (
                <div key={m.id} className={`bubble-sm ${m.sender === "leila" ? "me" : "them"}`}>
                  <div className="author">{m.sender === "user" ? "Cliente" : m.sender === "bot" ? "Bot" : "Tú"}</div>
                  {m.text}
                </div>
              ))}
            </div>
            {convo.status !== "resolved" && (
              <form className="chat-pane-footer" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input className="chat-input" placeholder="Respondele al cliente..." value={reply} onChange={(e) => setReply(e.target.value)} />
                <button className="btn-primary" type="submit">Enviar</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const AREA_LIST = [
  { key: "reparar", label: "🔧 Reparar mi celu" },
  { key: "comprar", label: "📱 Comprar un celu" },
  { key: "cursos_presenciales", label: "🎓 Cursos presenciales" },
  { key: "cursos_online", label: "💻 Cursos online" },
  { key: "maquinas", label: "🔩 Máquinas y herramientas" },
  { key: "repuestos", label: "📦 Repuestos por mayor" },
  { key: "alquilar", label: "🎙️ Alquilar espacios" },
];

function Content() {
  const content = useStore((s) => s.content);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function open(key: string) {
    setEditing(key);
    setDraft(content[key] ?? "");
  }
  function save() {
    if (!editing) return;
    store.setState((s) => ({ ...s, content: { ...s.content, [editing]: draft } }));
    setEditing(null);
  }

  return (
    <>
      <div className="panel" style={{ padding: 0 }}>
        {AREA_LIST.map((a) => (
          <div className="area-list-row" key={a.key}>
            <span style={{ fontWeight: 600 }}>{a.label}</span>
            <button className="btn-secondary" onClick={() => open(a.key)}>Editar</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar manual: {AREA_LIST.find((a) => a.key === editing)?.label}</h3>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Config() {
  const config = useStore((s) => s.config);
  const [draft, setDraft] = useState(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setDraft(config); }, [config]);

  function save() {
    store.setState((s) => ({ ...s, config: draft }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="config-grid">
      <div className="panel">
        <h2>Agente</h2>
        <div className="config-row" style={{ marginBottom: 14 }}>
          <label>Nombre del agente</label>
          <input value={draft.agentName} onChange={(e) => setDraft({ ...draft, agentName: e.target.value })} />
        </div>
        <div className="config-row" style={{ marginBottom: 14 }}>
          <label>Mensaje de bienvenida</label>
          <textarea value={draft.welcome} onChange={(e) => setDraft({ ...draft, welcome: e.target.value })} />
        </div>
        <div className="toggle-row" style={{ marginBottom: 10 }}>
          <span>Agente activo</span>
          <button className={`switch ${draft.agentActive ? "on" : ""}`} onClick={() => setDraft({ ...draft, agentActive: !draft.agentActive })} aria-label="Toggle agente" />
        </div>
        <div className="toggle-row">
          <span>Mostrar indicador "Leila disponible"</span>
          <button className={`switch ${draft.showLeilaIndicator ? "on" : ""}`} onClick={() => setDraft({ ...draft, showLeilaIndicator: !draft.showLeilaIndicator })} aria-label="Toggle indicador" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn-primary" onClick={save}>Guardar configuración</button>
        {saved && <span style={{ color: "var(--servant-green)", fontSize: 13 }}>✓ Cambios guardados</span>}
      </div>
    </div>
  );
}
