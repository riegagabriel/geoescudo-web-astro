import fs from "node:fs";
import path from "node:path";

// Lee los JSON ya procesados por los ETL directamente desde public/data/ en
// tiempo de build (Node, no fetch): así ninguna cifra del sitio se escribe a
// mano — todo queda trazable a OUTPUTS_DASHBOARD/*.json. El mismo archivo
// también se sirve en runtime desde /data/ para el explorador (fetch de los
// GeoJSON en el navegador).
const DATA_DIR = path.join(process.cwd(), "public", "data");

function readJson<T = any>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

export const proximidad = readJson("proximidad_verificada.json");
export const agregados = readJson("agregados_sidpol.json");
export const enapresExtorsion = readJson("enapres_extorsion.json");
export const enapresDistrital = readJson("enapres_distrital.json");
export const ibcDistrital = readJson("ibc_distrital.json");

export function fmt(n: number): string {
  return n.toLocaleString("es-PE");
}
