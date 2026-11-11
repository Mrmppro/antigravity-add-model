"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapGeminiToAnthropic = mapGeminiToAnthropic;
exports.mapAnthropicToGemini = mapAnthropicToGemini;
exports.mapAnthropicChunkToGemini = mapAnthropicChunkToGemini;
exports.mapGeminiToolsToAnthropic = mapGeminiToolsToAnthropic;
exports.normalizeSchemaForAnthropic = normalizeSchemaForAnthropic;
/**
 * Anthropic provider translator.
 * Handles Gemini ↔ Anthropic request/response mapping and streaming SSE events.
 */
const path = __importStar(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const utils_1 = require("./utils");
const shared_1 = require("../shared");
const modelUtils_1 = require("../modelUtils");
// ─── REQUEST: Gemini → Anthropic ──────────────────────────────────────────
function cleanPropertySchema(raw) {
    const schema = {};
    if (typeof raw.description === 'string' && raw.description) {
        schema.description = raw.description;
    }
    if (typeof raw.title === 'string' && raw.title) {
        schema.title = raw.title;
    }
    if (Array.isArray(raw.enum) && raw.enum.length > 0) {
        schema.enum = raw.enum;
    }
    if (raw.default !== undefined && raw.default !== null) {
        schema.default = raw.default;
    }
    if (typeof raw.minimum === 'number')
        schema.minimum = raw.minimum;
    if (typeof raw.maximum === 'number')
        schema.maximum = raw.maximum;
    if (typeof raw.minLength === 'number')
        schema.minLength = raw.minLength;
    if (typeof raw.maxLength === 'number')
        schema.maxLength = raw.maxLength;
    if (typeof raw.pattern === 'string' && raw.pattern)
        schema.pattern = raw.pattern;
    // Type determination
    if (Array.isArray(raw.type)) {
        schema.type = raw.type.map((t) => String(t).toLowerCase());
    }
    else {
        const rawType = typeof raw.type === 'string' ? raw.type.toLowerCase() : undefined;
        if (rawType === 'int' || rawType === 'integer') {
            schema.type = 'integer';
        }
        else if (rawType === 'number' || rawType === 'float' || rawType === 'double') {
            schema.type = 'number';
        }
        else if (rawType === 'boolean' || rawType === 'bool') {
            schema.type = 'boolean';
        }
        else if (rawType === 'array') {
            schema.type = 'array';
            if (raw.items && typeof raw.items === 'object' && !Array.isArray(raw.items)) {
                schema.items = cleanPropertySchema(raw.items);
            }
            else {
                schema.items = { type: 'string' };
            }
        }
        else if (rawType === 'object' || raw.properties) {
            schema.type = 'object';
            const subProps = {};
            if (raw.properties && typeof raw.properties === 'object' && !Array.isArray(raw.properties)) {
                for (const [k, v] of Object.entries(raw.properties)) {
                    if (v && typeof v === 'object' && !Array.isArray(v)) {
                        subProps[k] = cleanPropertySchema(v);
                    }
                    else {
                        subProps[k] = { type: 'string' };
                    }
                }
            }
            schema.properties = subProps;
            if (Array.isArray(raw.required)) {
                const validSubReq = raw.required
                    .filter((r) => typeof r === 'string' && Object.prototype.hasOwnProperty.call(subProps, r));
                if (validSubReq.length > 0) {
                    schema.required = validSubReq;
                }
            }
        }
        else {
            schema.type = 'string';
        }
    }
    return schema;
}
function normalizeSchemaForAnthropic(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return { type: 'object', properties: {} };
    }
    const obj = raw;
    const result = {
        type: 'object',
    };
    if (typeof obj.description === 'string' && obj.description) {
        result.description = obj.description;
    }
    const properties = {};
    const rawProps = obj.properties && typeof obj.properties === 'object' && !Array.isArray(obj.properties)
        ? obj.properties
        : {};
    for (const [propName, propVal] of Object.entries(rawProps)) {
        if (propVal && typeof propVal === 'object' && !Array.isArray(propVal)) {
            properties[propName] = cleanPropertySchema(propVal);
        }
        else {
            properties[propName] = { type: 'string' };
        }
    }
    result.properties = properties;
    if (Array.isArray(obj.required)) {
        const validRequired = obj.required
            .filter((r) => typeof r === 'string' && Object.prototype.hasOwnProperty.call(properties, r));
        if (validRequired.length > 0) {
            result.required = validRequired;
        }
    }
    return result;
}
function mapGeminiToolsToAnthropic(geminiTools) {
    if (!geminiTools || !Array.isArray(geminiTools))
        return [];
    const anthropicTools = [];
    for (const toolGroup of geminiTools) {
        if (toolGroup.functionDeclarations && Array.isArray(toolGroup.functionDeclarations)) {
            for (const func of toolGroup.functionDeclarations) {
                anthropicTools.push({
                    name: func.name,
                    description: func.description || func.name,
                    input_schema: normalizeSchemaForAnthropic(func.parameters),
                });
            }
        }
    }
    return anthropicTools;
}
function mapGeminiToAnthropic(geminiBody, modelName) {
    const messages = [];
    let system = undefined;
    if (geminiBody.systemInstruction && geminiBody.systemInstruction.parts) {
        system = geminiBody.systemInstruction.parts.map((p) => p.text || '').join('');
    }
    if (geminiBody.contents) {
        for (const item of geminiBody.contents) {
            if (item.parts) {
                const hasFunctionCall = item.parts.some((p) => p.functionCall);
                const hasFunctionResponse = item.parts.some((p) => p.functionResponse);
                if (hasFunctionCall && item.role === 'model') {
                    const contentBlocks = [];
                    for (const p of item.parts) {
                        if (p.text)
                            contentBlocks.push({ type: 'text', text: p.text });
                        if (p.functionCall) {
                            const callId = p.functionCall.id || 'call_' + Math.random().toString(36).slice(2, 10);
                            let originalName = p.functionCall.name;
                            let originalArgs = p.functionCall.args;
                            const translatedInfo = shared_1.translatedToolCalls.get(callId);
                            if (translatedInfo) {
                                originalName = translatedInfo.originalName;
                                originalArgs = { CommandLine: translatedInfo.cmd, Cwd: translatedInfo.cwd };
                            }
                            contentBlocks.push({
                                type: 'tool_use',
                                id: callId,
                                name: originalName,
                                input: typeof originalArgs === 'string'
                                    ? JSON.parse(originalArgs)
                                    : originalArgs,
                            });
                        }
                    }
                    messages.push({ role: 'assistant', content: contentBlocks });
                }
                else if (hasFunctionResponse) {
                    const contentBlocks = [];
                    for (const p of item.parts) {
                        if (p.functionResponse) {
                            const funcName = p.functionResponse.name || '';
                            const modelTCIds = shared_1.modelToolCallIds.get(modelName) || {};
                            const toolCallId = p.functionResponse.id || modelTCIds[funcName] || 'call_' + funcName;
                            const responseData = p.functionResponse.response;
                            let contentStr = '';
                            const translatedInfo = shared_1.translatedToolCalls.get(toolCallId);
                            if (translatedInfo) {
                                contentStr = (0, utils_1.formatTranslatedResponse)(translatedInfo, responseData);
                            }
                            else {
                                contentStr = typeof responseData === 'string' ? responseData : JSON.stringify(responseData || {});
                            }
                            contentBlocks.push({
                                type: 'tool_result',
                                tool_use_id: toolCallId,
                                content: contentStr,
                            });
                        }
                    }
                    messages.push({ role: 'user', content: contentBlocks });
                }
                else {
                    const roleStr = item.role === 'model' ? 'assistant' : item.role || 'user';
                    let content = '';
                    if (item.parts) {
                        const partsContent = [];
                        for (const p of item.parts) {
                            if (p.text) {
                                partsContent.push(p.text);
                            }
                            else if (p.fileData) {
                                const fd = p.fileData;
                                try {
                                    const url = new URL(fd.fileUri);
                                    if (url.protocol === 'file:') {
                                        const fs = require('fs');
                                        partsContent.push(`[File:\n${fs.readFileSync(url.pathname.replace(/^\//, '').replace(/\//g, path.sep), 'utf-8')}\n]`);
                                    }
                                    else {
                                        partsContent.push(`[File: ${fd.fileUri} (${fd.mimeType})]`);
                                    }
                                }
                                catch {
                                    partsContent.push(`[File: ${fd.fileUri} (${fd.mimeType})]`);
                                }
                            }
                            else if (p.inlineData) {
                                const id = p.inlineData;
                                partsContent.push(`[${id.mimeType}: ${id.data}]`);
                            }
                        }
                        content = partsContent.join('\n');
                    }
                    if (roleStr === 'system') {
                        system = (system || '') + '\n' + content;
                    }
                    else {
                        messages.push({ role: roleStr, content });
                    }
                }
            }
        }
    }
    const result = {
        model: modelName,
        messages,
        system,
        max_tokens: geminiBody.generationConfig?.maxOutputTokens ?? 16000,
    };
    // Claude thinking models don't support temperature (centralized detection)
    const { isThinkingModel } = (0, modelUtils_1.detectModelCapabilitiesByName)(modelName);
    if (!isThinkingModel) {
        const temp = geminiBody.generationConfig?.temperature;
        if (temp !== undefined && temp !== null)
            result.temperature = temp;
    }
    if (geminiBody.tools && Array.isArray(geminiBody.tools)) {
        const anthTools = mapGeminiToolsToAnthropic(geminiBody.tools);
        if (anthTools.length > 0)
            result.tools = anthTools;
    }
    return result;
}
// ─── RESPONSE: Anthropic → Gemini ─────────────────────────────────────────
function mapAnthropicToGemini(anthRes, modelName) {
    const contentBlocks = anthRes.content || [];
    const parts = [];
    const functionCalls = [];
    for (const block of contentBlocks) {
        if (block.type === 'text' && block.text) {
            parts.push({ text: block.text });
        }
        else if (block.type === 'thinking' && block.thinking) {
            parts.push({ text: block.thinking, thought: true });
        }
        else if (block.type === 'tool_use') {
            const modelTCIds = shared_1.modelToolCallIds.get(modelName) || {};
            modelTCIds[block.name || ''] = block.id || '';
            shared_1.modelToolCallIds.set(modelName, modelTCIds);
            (0, shared_1.touchStateTimestamp)(shared_1.stateTimestamps.toolCallIds, modelName);
            const normalizedInput = (0, utils_1.normalizeToolArgs)(block.name || '', block.input || {});
            const translated = (0, utils_1.translateToolCallToNative)(block.name || '', normalizedInput);
            if (translated.name !== block.name) {
                translated.args = (0, utils_1.normalizeToolArgs)(translated.name, translated.args);
                shared_1.translatedToolCalls.set(block.id || '', {
                    originalName: block.name || '',
                    translatedName: translated.name,
                    cmd: normalizedInput.CommandLine || '',
                    cwd: normalizedInput.Cwd || '',
                });
                (0, shared_1.touchStateTimestamp)(shared_1.stateTimestamps.translatedCalls, block.id || '');
            }
            functionCalls.push({
                functionCall: { name: translated.name, args: translated.args, id: block.id },
            });
        }
    }
    if (functionCalls.length > 0) {
        return {
            candidates: [
                { content: { parts: [...parts, ...functionCalls], role: 'model' }, finishReason: 'TOOL_CALL', index: 0 },
            ],
            usageMetadata: {
                promptTokenCount: anthRes.usage?.input_tokens || 0,
                candidatesTokenCount: anthRes.usage?.output_tokens || 0,
                totalTokenCount: (anthRes.usage?.input_tokens || 0) + (anthRes.usage?.output_tokens || 0),
            },
        };
    }
    const finishReason = anthRes.stop_reason === 'end_turn' ? 'STOP' : anthRes.stop_reason === 'max_tokens' ? 'MAX_TOKENS' : 'OTHER';
    return {
        candidates: [{ content: { parts, role: 'model' }, finishReason, index: 0 }],
        usageMetadata: {
            promptTokenCount: anthRes.usage?.input_tokens || 0,
            candidatesTokenCount: anthRes.usage?.output_tokens || 0,
            totalTokenCount: (anthRes.usage?.input_tokens || 0) + (anthRes.usage?.output_tokens || 0),
        },
    };
}
// ─── STREAM CHUNK: Anthropic SSE → Gemini ─────────────────────────────────
function mapAnthropicChunkToGemini(chunk, modelName) {
    const type = chunk.type;
    const streamId = chunk.message?.id || 'anthropic_stream';
    if (!shared_1.activeStreamContexts.has(streamId)) {
        shared_1.activeStreamContexts.set(streamId, { accumulatedText: '', accumulatedReasoning: '', toolCalls: {} });
        (0, shared_1.touchStateTimestamp)(shared_1.stateTimestamps.streamCtx, streamId);
    }
    const context = shared_1.activeStreamContexts.get(streamId);
    if (type === 'content_block_start') {
        const block = chunk.content_block;
        const idx = chunk.index ?? 0;
        if (block?.type === 'tool_use') {
            context.toolCalls[idx] = { id: block.id || '', name: block.name || '', arguments: '' };
        }
    }
    if (type === 'content_block_delta') {
        const delta = chunk.delta;
        const idx = chunk.index ?? 0;
        if (delta?.type === 'text_delta') {
            const text = delta.text || '';
            context.accumulatedText += text;
            return { content: { parts: [{ text }], role: 'model' }, finishReason: 'OTHER', index: 0 };
        }
        else if (delta?.type === 'thinking_delta') {
            const thinkingText = delta.thinking || '';
            context.accumulatedReasoning += thinkingText;
            return {
                content: { parts: [{ text: thinkingText, thought: true }], role: 'model' },
                finishReason: 'OTHER',
                index: 0,
            };
        }
        else if (delta?.type === 'input_delta') {
            if (context.toolCalls[idx]) {
                context.toolCalls[idx].arguments += delta.partial_json || '';
            }
        }
    }
    if (type === 'message_delta') {
        const delta = chunk.delta;
        if (delta?.stop_reason === 'tool_use') {
            const parts = Object.values(context.toolCalls).map((tc) => {
                let args = {};
                try {
                    args = JSON.parse(tc.arguments);
                }
                catch (e) {
                    electron_log_1.default.debug('[Anthropic] Stream tool args parse fallback:', e.message);
                    args = {};
                }
                args = (0, utils_1.normalizeToolArgs)(tc.name, args);
                const modelTCIds = shared_1.modelToolCallIds.get(modelName) || {};
                modelTCIds[tc.name] = tc.id;
                shared_1.modelToolCallIds.set(modelName, modelTCIds);
                (0, shared_1.touchStateTimestamp)(shared_1.stateTimestamps.toolCallIds, modelName);
                const translated = (0, utils_1.translateToolCallToNative)(tc.name, args);
                if (translated.name !== tc.name) {
                    shared_1.translatedToolCalls.set(tc.id, {
                        originalName: tc.name,
                        translatedName: translated.name,
                        cmd: args.CommandLine || '',
                        cwd: args.Cwd || '',
                    });
                    (0, shared_1.touchStateTimestamp)(shared_1.stateTimestamps.translatedCalls, tc.id);
                }
                return { functionCall: { name: translated.name, args: translated.args, id: tc.id } };
            });
            shared_1.activeStreamContexts.delete(streamId);
            return { content: { parts, role: 'model' }, finishReason: 'TOOL_CALL', index: 0 };
        }
    }
    if (type === 'message_stop') {
        shared_1.activeStreamContexts.delete(streamId);
        return { content: { parts: [], role: 'model' }, finishReason: 'STOP', index: 0 };
    }
    return null;
}
//# sourceMappingURL=anthropic.js.map