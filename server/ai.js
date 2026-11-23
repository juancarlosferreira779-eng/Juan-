'use strict';

const SYSTEM_PROMPT = `Eres Nexo IA, el asistente integrado en Nexo Chat. Respondes en español, de forma cercana, breve y útil (máximo 3 párrafos cortos). Puedes ayudar a redactar mensajes, dar ideas, explicar las funciones de la app, resolver dudas generales y mantener una conversación amable. Si no sabes algo, dilo con honestidad.`;

function localReply(question, history = []) {
  const q = String(question || '').toLowerCase().trim();
  const recent = history.slice(-6).map((h) => `${h.role}: ${h.content}`).join('\n');

  if (!q) return '¡Hola! Soy Nexo IA. ¿En qué te puedo ayudar hoy? 😊';

  if (/hola|buenos días|buenas tardes|buenas noches|hey|hi/.test(q) && q.length < 24)
    return '¡Hola! 👋 Soy tu asistente dentro de Nexo Chat. Puedo ayudarte a escribir mensajes, organizar ideas o responder preguntas. ¿Qué necesitas?';

  if (/cómo|como puedo|ayuda|qué puedes|que puedes|funciones|características|caracteristicas/.test(q))
    return 'Puedo ayudarte con muchas cosas:\n\n• Redactar y mejorar mensajes\n• Resumir textos o ideas\n• Explicar las funciones de Nexo Chat\n•Dar ideas para grupos, eventos o proyectos\n• Resolver dudas generales\n\nTambién puedes usar la app para chats privados, grupos, llamadas, estados de 24 h, notas de voz y más.';

  if (/redact|escrib|mensaje|dialogo|diálogo|texto para/.test(q)) {
    const topic = q.replace(/^(redacta|escribe|ayúdame a escribir|ayudame a escribir|un|una)\s+/g, '').trim();
    return `Claro, aquí tienes una opción:\n\n«¡Hola! ${topic || 'Quería comentarte algo importante'}. ¿Cómo estás? Me gustaría saber tu opinión cuando tengas un momento. 😊»\n\nSi quieres un tono más formal, divertido o directo, dime y lo ajusto.`;
  }

  if (/resum|resumen/.test(q)) {
    const source = q.split(/[:\-]/).slice(1).join(' ').trim() || q.replace(/resume|resumen/gi, '').trim();
    return `Resumen: ${source ? `${source.slice(0, 180)}${source.length > 180 ? '…' : ''}` : 'Comparte el texto y lo resumo en unas pocas ideas clave.'}\n\nPuntos principales:\n• Idea central\n• Detalles relevantes\n• Próximo paso sugerido`;
  }

  if (/traduc/.test(q)) return 'Puedo ayudarte con traducciones. Escribe el texto y dime el idioma de destino, y lo traduzco para ti.';

  if (/idea|suger|plan|organizar|evento/.test(q))
    return 'Aquí van tres ideas rápidas:\n\n1️⃣ Definir el objetivo y el público.\n2️⃣ Crear un grupo en Nexo Chat para coordinar detalles.\n3️⃣ Compartir un estado de 24 h para mantener a todos al tanto.\n\n¿Quieres que desarrolle alguna de ellas?';

  if (/hora|fecha|día/.test(q)) {
    const d = new Date();
    return `Ahora mismo son las ${d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} del ${d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
  }

  if (/gracias/.test(q)) return '¡Con gusto! 😊 Si necesitas algo más, aquí estoy.';

  if (/estás|estas|bien|cómo estás|como estas/.test(q)) return '¡Muy bien, gracias por preguntar! Listo para ayudarte con lo que necesites. 🚀';

  const words = q.split(/\s+/).filter(Boolean).slice(0, 12).join(' ');
  return `Entendí: «${words || q}». Puedo ayudarte a convertir eso en un mensaje claro, un resumen o una lista de pasos. ¿Quieres que lo redacte o que lo explique con más detalle?${recent ? '\n\n(También tengo en cuenta lo que acabamos de hablar.)' : ''}`;
}

async function reply({ message, history, user }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(history || []).slice(-12).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '').slice(0, 2000) })),
            { role: 'user', content: String(message || '').slice(0, 2000) },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return { text, source: 'openai' };
      }
    } catch (err) {
      console.warn('[IA] Fallback local:', err.message);
    }
  }
  return { text: localReply(message, history), source: 'local' };
}

module.exports = { reply };
