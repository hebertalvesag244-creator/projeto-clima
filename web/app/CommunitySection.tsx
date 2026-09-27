"use client";

import { FormEvent, useEffect, useState } from "react";

type Report = { id: string; city: string; type: string; details: string; createdAt: string };
const reportLabels: Record<string, string> = { rain: "Chuva", flooding: "Alagamento", wind: "Vento forte", clear: "Tempo aberto", other: "Outro" };

export default function CommunitySection({ defaultCity }: { defaultCity: string }) {
  const [city, setCity] = useState(defaultCity);
  const [type, setType] = useState("rain");
  const [details, setDetails] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  useEffect(() => { setCity(defaultCity); }, [defaultCity]);
  useEffect(() => {
    fetch(api + "/api/reports?city=" + encodeURIComponent(city))
      .then(response => response.json())
      .then(result => setReports(result.items ?? []))
      .catch(() => setReports([]));
  }, [api, city]);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setError("");
    try {
      const response = await fetch(api + "/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city, type, details }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível enviar o relato.");
      setReports(items => [result.report, ...items].slice(0, 20));
      setDetails("");
    } catch (problem) { setError(problem instanceof Error ? problem.message : "Erro ao enviar o relato."); }
    finally { setSending(false); }
  }

  return <section id="comunidade" className="community" aria-labelledby="community-title">
    <div className="community-heading"><div><span className="sectionLabel section-label">OBSERVAÇÕES DA COMUNIDADE</span><h2 id="community-title">O que está acontecendo por aí?</h2></div><p>Compartilhe o tempo que você está vendo.</p></div>
    <div className="community-notice">Relatos enviados por usuários. Não são verificados e não substituem alertas oficiais.</div>
    <div className="community-layout">
      <form className="report-form" onSubmit={submitReport}>
        <label>Cidade<input value={city} onChange={event => setCity(event.target.value)} maxLength={80} required /></label>
        <label>O que você está observando?<select value={type} onChange={event => setType(event.target.value)}><option value="rain">Chuva</option><option value="flooding">Alagamento</option><option value="wind">Vento forte</option><option value="clear">Tempo aberto</option><option value="other">Outro</option></select></label>
        <label>Conte em poucas palavras<textarea value={details} onChange={event => setDetails(event.target.value)} minLength={3} maxLength={240} placeholder="Ex.: chuva forte perto do centro" required /></label>
        <div className="report-submit"><span>{details.length}/240</span><button disabled={sending}>{sending ? "Enviando…" : "Compartilhar relato"}</button></div>
        {error && <p className="report-error" role="alert">{error}</p>}
      </form>
      <div className="report-feed"><h3>Relatos recentes <span>{city}</span></h3>{reports.length ? reports.map(report => <article className="report-item" key={report.id}><div><span className="report-type">{reportLabels[report.type] ?? "Relato"}</span><time dateTime={report.createdAt}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(report.createdAt))}</time></div><p>{report.details}</p><small>{report.city} · enviado por usuário</small></article>) : <p className="report-empty">Ainda não há relatos para esta cidade. Você pode compartilhar o primeiro.</p>}</div>
    </div>
  </section>;
}
