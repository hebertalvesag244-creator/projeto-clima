import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json({ limit: "10kb" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/weather", async (request, response) => {
  const city = String(request.query.city ?? "").trim();
  if (!city) return response.status(400).json({ error: "Informe o nome de uma cidade." });
  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.search = new URLSearchParams({ name: city, count: "1", language: "pt", format: "json" }).toString();
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Falha ao localizar cidade");
    const geo = await geoResponse.json() as { results?: Array<{ name: string; admin1?: string; country: string; latitude: number; longitude: number }> };
    const location = geo.results?.[0];
    if (!location) return response.status(404).json({ error: "Cidade não encontrada. Tente outro nome." });
    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.search = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m", daily: "weather_code,temperature_2m_max,temperature_2m_min", forecast_days: "5", timezone: "auto" }).toString();
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error("Falha ao obter previsão");
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return response.json({ location, ...await forecastResponse.json() });
  } catch (error) {
    console.error("Weather request failed:", error);
    return response.status(502).json({ error: "Serviço de previsão indisponível. Tente novamente em instantes." });
  }
});
type WeatherReport = { id: string; city: string; type: string; details: string; createdAt: string };
const reports: WeatherReport[] = [];
const reportTypes = new Set(["rain", "flooding", "wind", "clear", "other"]);

const articles = [
  { slug: "interpretar-chance-de-chuva", category: "Previsão", title: "Como interpretar a chance de chuva", summary: "O que a porcentagem quer dizer e como usá-la para planejar o dia.", readingMinutes: 3, content: ["A chance de chuva é uma estimativa para um período e local da previsão. Ela ajuda a avaliar a possibilidade de precipitação, mas não indica exatamente em que horário a chuva começará.", "A porcentagem também não informa quanto de chuva pode cair. Para isso, consulte a previsão de volume de precipitação e acompanhe a atualização mais recente para a sua região.", "Como a chuva pode variar de um bairro para outro, use a previsão como orientação e acompanhe os avisos oficiais quando houver risco de tempo severo."], source: { label: "National Weather Service: Probability of Precipitation", url: "https://www.weather.gov/pdt/glossary" } },
  { slug: "tempo-e-clima", category: "Clima", title: "Tempo e clima: qual é a diferença?", summary: "Uma explicação simples para separar as condições de hoje das tendências observadas ao longo do tempo.", readingMinutes: 4, content: ["Tempo descreve as condições atmosféricas em um lugar e momento: por exemplo, temperatura, chuva, vento e nebulosidade. Essas condições podem mudar ao longo do dia e variar entre locais próximos.", "Clima descreve padrões e variações observados durante períodos longos. Uma previsão para amanhã fala do tempo; uma análise de padrões de muitas décadas ajuda a descrever o clima.", "Os dois conceitos se relacionam, mas respondem perguntas diferentes. A previsão ajuda a planejar o cotidiano; informações climáticas ajudam a entender padrões de uma região e como eles se transformam."], source: { label: "NOAA Climate.gov: diferença entre tempo e clima", url: "https://www.climate.gov/maps-data/climate-data-primer/whats-difference-between-climate-and-weather" } },
  { slug: "calor-e-rotina", category: "Meio ambiente", title: "Dias de calor: como se preparar", summary: "Acompanhe a previsão e ajuste a rotina durante períodos de temperatura elevada.", readingMinutes: 3, content: ["Em dias muito quentes, confira a previsão e os avisos oficiais antes de organizar atividades ao ar livre. Sempre que possível, planeje tarefas para os horários mais frescos e procure ambientes ventilados ou frescos.", "O Ministério da Saúde recomenda beber água regularmente e ter atenção redobrada com crianças, pessoas idosas, gestantes e pessoas com condições de saúde preexistentes durante ondas de calor.", "Fraqueza, tontura, náuseas, dor de cabeça e transpiração excessiva podem ser sinais de alerta. Procure uma unidade de saúde para avaliação se esses sintomas aparecerem."], source: { label: "Ministério da Saúde: Ondas de Calor", url: "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/o/ondas-de-calor" } }
];

app.get("/api/articles", (_request, response) => {
  response.setHeader("Cache-Control", "public, max-age=300");
  response.json({ items: articles.map(({ content, source, ...article }) => article), demo: true });
});

app.get("/api/articles/:slug", (request, response) => {
  const article = articles.find(item => item.slug === request.params.slug);
  if (!article) return response.status(404).json({ error: "Artigo não encontrado." });
  response.setHeader("Cache-Control", "public, max-age=300");
  return response.json({ article, demo: true });
});

app.get("/api/reports", (request, response) => {
  const city = String(request.query.city ?? "").trim().toLocaleLowerCase("pt-BR");
  const items = reports.filter(report => !city || report.city.toLocaleLowerCase("pt-BR") === city).slice(0, 20);
  response.json({ items, verified: false });
});

app.post("/api/reports", (request, response) => {
  const city = typeof request.body?.city === "string" ? request.body.city.trim() : "";
  const type = typeof request.body?.type === "string" ? request.body.type : "";
  const details = typeof request.body?.details === "string" ? request.body.details.trim() : "";
  if (city.length < 2 || city.length > 80 || !reportTypes.has(type) || details.length < 3 || details.length > 240) {
    return response.status(400).json({ error: "Confira a cidade, o tipo e o relato (de 3 a 240 caracteres)." });
  }
  const report: WeatherReport = { id: randomUUID(), city, type, details, createdAt: new Date().toISOString() };
  reports.unshift(report);
  return response.status(201).json({ report, verified: false });
});

app.listen(port, () => console.log("API do Projeto Clima em http://localhost:" + port));
