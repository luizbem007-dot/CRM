export interface ZapiResponse {
  ok: boolean;
  status: number;
  bodyText: string;
}

const DEFAULT_ZAPI = "https://api.z-api.io/instances/3E97080A6033712B38C3922F34499783/token/0B33D7C0F338A98F82743FEE/send-text";

export async function sendTextZapi(phone: string, message: string): Promise<ZapiResponse> {
  const ZAPI_URL = (import.meta.env as any).VITE_ZAPI_URL ?? DEFAULT_ZAPI;
  try {
    const CLIENT_TOKEN = (import.meta.env as any).VITE_ZAPI_CLIENT_TOKEN ?? "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CLIENT_TOKEN) headers["Client-Token"] = CLIENT_TOKEN;

    console.log("Enviando mensagem:", phone, message);
    const res = await fetch(ZAPI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone, message }),
    });

    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch (e) {
      try {
        bodyText = await res.clone().text();
      } catch (e2) {
        bodyText = `<error reading response body: ${e2?.message ?? String(e2)}>`;
      }
    }

    const result = { ok: res.ok, status: res.status, bodyText };
    console.log("Resposta Z-API:", result);
    return result;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("Erro na requisição Z-API:", msg);
    return { ok: false, status: 0, bodyText: `<network error: ${msg}>` };
  }
}
