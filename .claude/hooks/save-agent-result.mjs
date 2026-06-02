#!/usr/bin/env node
/**
 * Hook SubagentStop: registra el resultado de cada subagente en docs.
 *
 * Lee por stdin el JSON del hook (incluye transcript_path del subagente),
 * extrae el ultimo mensaje del asistente (el reporte final del agente) y lo
 * apende como una entrada con timestamp ISO en
 *   docs/pm/agentes/registro-de-agentes.md
 *
 * Diseñado para NO fallar nunca: cualquier error se traga y sale con codigo 0
 * para no interrumpir el flujo de Claude Code.
 */
import { readFileSync, appendFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../');
const LOG_DIR = resolve(REPO_ROOT, 'docs/pm/agentes');
const LOG_FILE = resolve(LOG_DIR, 'registro-de-agentes.md');
const MAX_CHARS = 6000; // recorte del reporte para no inflar el doc

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function lastAssistantText(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;
  let texts = [];
  try {
    const lines = readFileSync(transcriptPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let rec;
      try { rec = JSON.parse(trimmed); } catch { continue; }
      const msg = rec?.message ?? rec;
      const role = msg?.role ?? rec?.type;
      if (role !== 'assistant') continue;
      const content = msg?.content;
      let text = '';
      if (typeof content === 'string') text = content;
      else if (Array.isArray(content)) {
        text = content.filter((c) => c?.type === 'text' && c.text).map((c) => c.text).join('\n');
      }
      if (text.trim()) texts.push(text.trim());
    }
  } catch { return null; }
  return texts.length ? texts[texts.length - 1] : null;
}

function ensureLog() {
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  if (!existsSync(LOG_FILE)) {
    writeFileSync(LOG_FILE,
      '# Registro de resultados de agentes\n\n' +
      'Generado automaticamente por el hook SubagentStop\n' +
      '(`.claude/hooks/save-agent-result.mjs`). Cada entrada es el reporte\n' +
      'final de un subagente lanzado con la tool Agent/Task. Append-only.\n\n' +
      '---\n');
  }
}

function main() {
  let input = {};
  try { input = JSON.parse(readStdin() || '{}'); } catch { /* sigue con {} */ }
  const transcriptPath = input.transcript_path || input.transcriptPath || null;
  const sessionId = input.session_id || input.sessionId || 'desconocida';
  const report = lastAssistantText(transcriptPath);

  ensureLog();
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, '');
  let entry = `\n## ${ts}\n\n`;
  entry += `- **session**: ${sessionId}\n`;
  if (transcriptPath) entry += `- **transcript**: ${basename(transcriptPath)}\n`;
  entry += '\n';
  if (report) {
    entry += report.length > MAX_CHARS
      ? report.slice(0, MAX_CHARS) + '\n\n_(reporte truncado)_\n'
      : report + '\n';
  } else {
    entry += '_(sin reporte extraible del transcript)_\n';
  }
  entry += '\n---\n';

  try { appendFileSync(LOG_FILE, entry); } catch { /* noop */ }
}

try { main(); } catch { /* nunca interrumpir */ }
process.exit(0);
