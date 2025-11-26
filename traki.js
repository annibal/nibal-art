/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// UNUSED EXPORTS: traki

;// ./src/constants/constants.ts
// Storage keys
const STORAGE_KEYS = Object.freeze({
    API_KEY: "TRAKI_API_KEY",
    TRACE_ID: "TRAKI_TRACE_ID",
    CAMPAIGN_ID: "TRAKI_CAMPAIGN_ID",
    BASE_URL: "TRAKI_BASE_URL",
    SESSION_START: "TRAKI_SESSION_START",
    CHECKOUT_URL: "TRAKI_CHECKOUT_URL",
    UTM_SOURCE: "TRAKI_UTM_SOURCE",
});
/**
 * External Input Params Sources
 * Define the name of the possible sources to look for the EIPs (External Input Sources).
 *
 * Ex.:
 * The CAMPAIGN_ID might be stored in the SESSION_STORAGE.
 * The TRACE_ID might be provided via URL_PARAMS.
 * The BASE_URL could be set as an attribute of THIS_SCRIPT.
 *
 * The {EIP}'s value is probably defined in an {EIP Source}.
 * The {EIP} must be defined in at least one of the {EIP Sources}.
 *
 * This just names the External Input Param Sources.
 * They are used elsewhere as the keys of an object who assigns functions to them, defining then how exacly these Sources are queried for the EIP values.
 */
const EXTERNAL_PARAM_SOURCES = Object.freeze({
    URL_PARAMS: "URL_PARAMS",
    SESSION_STORAGE: "SESSION_STORAGE",
    LOCAL_STORAGE: "LOCAL_STORAGE",
    THIS_SCRIPT: "THIS_SCRIPT",
});
const DEFAULT_BASE_URL = "https://api.traki.io/";
const DEFAULT_API_VERSION = "v1";
const DEFAULT_CHECKOUT_URL = "https://pay.gamestickkwai.shop/n1NLgwJDyYVGMxE";
const TTY_LEVELS = {
    error: 1,
    warn: 2,
    log: 3,
    info: 4,
    debug: 5,
    group: 6,
    groupCollapsed: 6,
    groupEnd: 6,
    trace: 7,
};
/**
 * UUID v4 validation regex
 * Matches format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const constants_UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTM_SOURCE_ID_PARAM = "utm_source";
/**
 * E.I.P = External Input Params
 * An EIP variable is an external variable that gets it's value from either one of the possible sources.
 */
const X = EXTERNAL_PARAM_SOURCES;
const EIP_CONFIG = {
    API_KEY: {
        storageKey: STORAGE_KEYS.API_KEY,
        required: true,
        availableSourcesSorted: [X.THIS_SCRIPT, X.SESSION_STORAGE, X.LOCAL_STORAGE],
        nameWords: ["api", "key"],
    },
    CAMPAIGN_ID: {
        storageKey: STORAGE_KEYS.CAMPAIGN_ID,
        required: true,
        availableSourcesSorted: [X.URL_PARAMS, X.SESSION_STORAGE, X.LOCAL_STORAGE, X.THIS_SCRIPT],
        nameWords: ["campaign", "id"]
    },
    BASE_URL: {
        storageKey: STORAGE_KEYS.BASE_URL,
        defaultValue: DEFAULT_BASE_URL,
        availableSourcesSorted: [X.URL_PARAMS, X.SESSION_STORAGE, X.LOCAL_STORAGE, X.THIS_SCRIPT],
        nameWords: ["base", "url"]
    },
    TRACE_ID: {
        storageKey: STORAGE_KEYS.TRACE_ID,
        defaultValue: "",
        availableSourcesSorted: [X.URL_PARAMS, X.SESSION_STORAGE, X.LOCAL_STORAGE],
        nameWords: ["trace", "id"]
    },
    TTY_LEVEL: {
        storageKey: "",
        defaultValue: "none",
        availableSourcesSorted: [X.URL_PARAMS, X.THIS_SCRIPT],
        nameWords: ["tty", "lvl"]
    },
    CHECKOUT_URL: {
        storageKey: STORAGE_KEYS.CHECKOUT_URL,
        defaultValue: DEFAULT_CHECKOUT_URL,
        availableSourcesSorted: [X.THIS_SCRIPT, X.SESSION_STORAGE, X.LOCAL_STORAGE],
        nameWords: ["checkout", "url"]
    },
};

;// ./src/functions/storage.ts
function context(name) {
    const context = this;
    return {
        get() {
            return context.get(name);
        },
        set(value) {
            return context.set(name, value);
        },
        keys() {
            return Object.keys(context);
        }
    };
}
function createStore(storage) {
    return {
        context,
        get(key) {
            return storage.getItem(key) ?? undefined;
        },
        set(key, value) {
            storage.setItem(key, value);
        },
        keys() {
            return Object.keys(storage);
        }
    };
}
function asConst() {
    return (source) => source;
}
const stores = asConst()({
    local: createStore(localStorage),
    session: createStore(sessionStorage),
});

;// ./src/types/validators.ts
/**
 * Runtime Validation Helpers
 *
 * Lightweight client-side validation utilities for API types.
 * These provide basic validation without requiring heavy dependencies like Zod.
 */

/**
 * Validates if a string is a valid UUID v4
 */
function isValidUUID(value) {
    return typeof value === 'string' && UUID_V4_REGEX.test(value);
}
/**
 * Validates if a string is a valid ISO 8601 date
 */
function isValidISODate(value) {
    if (typeof value !== 'string')
        return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(value.slice(0, 10));
}
/**
 * Generates a UUID v4 (client-side)
 * Note: Uses crypto.randomUUID if available, falls back to Math.random
 */
function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * Validation error class
 */
class ValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
        this.name = 'ValidationError';
    }
}
/**
 * Validates required fields are present and non-empty
 */
const validateRequired = (value, field) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new ValidationError(`${field} is required`, field, value);
    }
};
/**
 * Validates UUID fields
 */
const validateUUID = (value, field) => {
    if (!isValidUUID(value)) {
        throw new ValidationError(`${field} must be a valid UUID v4`, field, value);
    }
};
/**
 * Validates optional UUID fields (allows undefined/null)
 */
const validateOptionalUUID = (value, field) => {
    if (value !== undefined && value !== null && !isValidUUID(value)) {
        throw new ValidationError(`${field} must be a valid UUID v4 or undefined`, field, value);
    }
};
/**
 * Validates ISO date fields
 */
const validateISODate = (value, field) => {
    if (!isValidISODate(value)) {
        throw new ValidationError(`${field} must be a valid ISO 8601 date`, field, value);
    }
};
/**
 * Validates optional ISO date fields
 */
const validateOptionalISODate = (value, field) => {
    if (value !== undefined && value !== null && !isValidISODate(value)) {
        throw new ValidationError(`${field} must be a valid ISO 8601 date or undefined`, field, value);
    }
};
function safeTry(fn, $default) {
    try {
        return fn();
    }
    catch {
        return $default;
    }
}
/**
 * Simpler way to validate several properties of an object
 * @param subject Object to validate the properties from
 * @param spec Tuple of propertyName and validator function
 * @returns true for all valid, false if any prop fails validation
 */
function validateStruct(subject, spec) {
    let res = { valid: true, fields: [] };
    spec.forEach(([field, validate]) => {
        try {
            validate(subject[field], String(field));
        }
        catch (e) {
            res.valid = false;
            if (e instanceof ValidationError) {
                res.fields.push({
                    field: e.field,
                    value: e.value,
                    msg: e.message
                });
            }
            else {
                res.fields.push({
                    field: String(field),
                    value: subject[field],
                    msg: `Unknown error when validating ${String(field)}`
                });
            }
        }
    });
    return res;
}

;// ./src/functions/URLSearchParamsWrapped.ts
function URLSearchParamsWrapped(search = "") {
    let __store = {};
    let initialSearch = search;
    if (!initialSearch) {
        try {
            initialSearch = location.search;
        }
        catch (e) {
            initialSearch = "";
        }
    }
    function load(strSearch) {
        __store = smartParseURLSearch(strSearch);
    }
    ;
    load(initialSearch);
    function serialize() {
        const searchString = Object.entries(__store)
            .map(([k, v]) => {
            const encK = encodeURIComponent(k);
            if (Array.isArray(v) && v?.length > 0) {
                return v.map((vitem) => `${encK}=${encodeURIComponent(String(vitem))}`).join("&");
            }
            if (v) {
                return `${encK}=${encodeURIComponent(String(v))}`;
            }
            return false;
        })
            .filter(Boolean)
            .join("&");
        return searchString;
    }
    return new Proxy({}, {
        get(_, prop) {
            if (prop === "load")
                return load;
            if (prop === Symbol.toPrimitive)
                return () => serialize();
            if (prop === "toString")
                return serialize;
            if (prop in __store)
                return __store[prop];
            return undefined;
        },
        set(_, prop, val) {
            __store[prop] = val;
            return true;
        }
    });
}
function smartParseURLSearch(str) {
    const out = {};
    const cleanStrSearch = str.startsWith("?") ? str.slice(1) : str;
    if (!cleanStrSearch)
        return out;
    for (let pair of cleanStrSearch.split("&")) {
        if (pair.includes("=")) {
            const [rawK, rawV] = pair.split("=").map(v => {
                try {
                    return decodeURIComponent(v);
                }
                catch (e) {
                    return "";
                }
            });
            const endsWithArr = rawK.endsWith("[]");
            const isCommaList = rawV.includes(",") && !endsWithArr;
            const key = endsWithArr ? rawK.slice(0, -2) : rawK;
            const val = isCommaList ? rawV.split(",").map(coerce) : coerce(rawV);
            push(out, key, val);
        }
        else {
            const rawK = decodeURIComponent(pair);
            push(out, rawK, true);
        }
    }
    return out;
    function push(obj, key, val) {
        if (val === undefined)
            return;
        if (val === null) {
            obj[key] = null;
            return;
        }
        if (Array.isArray(val)) {
            if (!obj[key])
                obj[key] = [];
            obj[key].push(...val);
            return;
        }
        if (obj[key] === undefined) {
            obj[key] = val;
        }
        else if (Array.isArray(obj[key])) {
            obj[key].push(val);
        }
        else {
            obj[key] = [obj[key], val];
        }
    }
    function coerce(val) {
        const v = val.toLowerCase();
        if (v === "" || v === "null")
            return null;
        if (v === "undefined")
            return undefined;
        if (v === "true")
            return true;
        if (v === "false")
            return false;
        if (!isNaN(Number(v)) && Number.isFinite(+v) && v.trim() !== "")
            return Number(v);
        return v;
    }
}

;// ./src/functions/currentScript.ts


const externalParamNames = Object.values(EIP_CONFIG).map(eip => eip.nameWords);
let currentScriptElement = null;
function hasTrackingAttributes(script) {
    if (!script) {
        return false;
    }
    const attributes = getAllElementAttributes(script);
    if (Object.keys(attributes).length < 1) {
        return false;
    }
    const foundEIPs = externalParamNames.map(epName => findAttrMatchWords(epName, attributes));
    const onlyFoundEIPValues = foundEIPs.filter(Boolean);
    return onlyFoundEIPValues.length >= 2;
}
function collectCandidateScripts() {
    const candidates = [
        document.currentScript,
        ...document.querySelectorAll(`script[src*="${DEFAULT_BASE_URL}"]`),
        ...Array.from(document.scripts).filter(x => x.src.includes("traki")),
    ];
    const seen = new Set();
    const scripts = [];
    candidates.forEach(candidate => {
        if (!(candidate instanceof HTMLScriptElement)) {
            return;
        }
        if (seen.has(candidate)) {
            return;
        }
        seen.add(candidate);
        scripts.push(candidate);
    });
    return scripts;
}
function resolveTrackingScript() {
    const candidates = collectCandidateScripts();
    for (const script of candidates) {
        if (hasTrackingAttributes(script)) {
            return script;
        }
    }
    return candidates[0] ?? null;
}
function getCurrentScript() {
    if (!currentScriptElement) {
        currentScriptElement = resolveTrackingScript();
    }
    return currentScriptElement;
}
;

;// ./src/functions/utmSourceManager.ts



function getFinalURL(inputURL) {
    if (!inputURL) {
        throw new Error(`getFinalURL: invalid argument inputURL with value "${inputURL}"`);
    }
    let strURL = Boolean(inputURL) ? (inputURL instanceof URL ? inputURL.toString() : String(inputURL)) : "";
    const utmSourceVal = inputSourceSelect.getUtmSource();
    // trkiout.trace(`getFinalURL: will append in "${inputURL}" the utm "${utmSourceVal}"`)
    const isValidURL = (function checkIfURLisValid(testURL) {
        try {
            if (!testURL)
                return false;
            if (testURL.charAt(0) === "#")
                return false;
            if (/^\s*javascript:/i.test(testURL))
                return false;
            const nurl = new URL(testURL, location.href);
            if (!/^https?:$/i.test(nurl.protocol)) {
                return false;
            }
            ;
            return true;
        }
        catch (err) {
            return false;
        }
    })(strURL);
    if (!isValidURL) {
        // trkiout.trace(`Trying to add UTM source to invalid URL '${strURL}'`);
        return "";
    }
    const objURL = new URL(strURL, location.href);
    if (!utmSourceVal) {
        log_trkiout.error("Failed to append UTM Source to URL");
        log_trkiout.log(`Original URL was '${inputURL}'`);
        console.debug(`API_KEY: ${inputSourceSelect.getApiKey()}`);
        console.debug(`TRACE_ID: ${inputSourceSelect.getTraceId()}`);
        return objURL.toString();
    }
    objURL.searchParams.set(UTM_SOURCE_ID_PARAM, utmSourceVal);
    return objURL.toString();
}
/**
 * Parses utm_source from URL and extracts trace_id and api_key
 * Expected format: {trace_id}::{api_key}
 * Example: 1953adf5-9f26-4740-ae7f-1d883e0fb674::tk_MhPRG01K_01K9gT5WSR0dJZhyNQJZ0BRCmw
 */
function parseUtmSource(fromSearch) {
    log_trkiout.groupCollapsed("Parse UTM Source");
    let baseSearch = location.search;
    if (!baseSearch)
        baseSearch = location.href.split("?")[1];
    if (fromSearch && fromSearch?.length > 2)
        baseSearch = fromSearch;
    try {
        const urlParams = new URLSearchParams(baseSearch);
        const utmSource = urlParams.get(UTM_SOURCE_ID_PARAM);
        if (!utmSource) {
            log_trkiout.debug('No utm_source found in URL', location.href, { UTM_SOURCE_ID_PARAM: UTM_SOURCE_ID_PARAM, baseSearch });
            return null;
        }
        // Parse format: trace_id::api_key
        const parts = utmSource.split('::');
        if (parts.length !== 2) {
            log_trkiout.warn(`Invalid utm_source format: ${utmSource} (expected: trace_id::api_key)`);
            return null;
        }
        const [traceId, apiKey] = parts;
        // Basic validation
        if (!traceId || !apiKey) {
            log_trkiout.warn(`Invalid utm_source parts: trace_id="${traceId}", api_key="${apiKey}"`);
            return null;
        }
        // URL decode in case it's encoded
        const decodedTraceId = decodeURIComponent(traceId);
        const decodedApiKey = decodeURIComponent(apiKey);
        log_trkiout.log(`Parsed utm_source: trace_id="${decodedTraceId}", api_key="${decodedApiKey}"`);
        log_trkiout.groupEnd();
        return {
            traceId: decodedTraceId,
            apiKey: decodedApiKey,
        };
    }
    catch (error) {
        log_trkiout.error('Failed to parse utm_source:', error);
        log_trkiout.groupEnd();
        return null;
    }
}
/**
 * Sets or updates the utm_source parameter in the current URL
 * without reloading the page
 */
function setUtmSourceInOwnUrl(utmSource) {
    log_trkiout.debug(`Will add utm_source to this page's own URL.`);
    try {
        const currentUrl = new URL(window.location.href);
        const url = getFinalURL(currentUrl);
        window.history.replaceState(window.history.state, '', url.toString());
        log_trkiout.log(`utm_source set in this page's URL: "${utmSource}"`);
    }
    catch (error) {
        log_trkiout.error('Failed to set utm_source in URL:', error);
    }
}

;// ./src/functions/inputSourceSelect.ts







const INPUT_SOURCES = {
    [EXTERNAL_PARAM_SOURCES.URL_PARAMS]: {
        // getParamValue: (() => {
        //   // TODO: deduplicate "getUrlParameters" function and use siungle utility source
        //   const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
        //   return function getParamValue(paramName: string) {
        //     let r = urlParams[paramName];
        //     if (!r) return null;
        //     if (r) r = decodeURIComponent(r);
        //     return r;
        //   }
        // })(),
        allSourceParams: (() => {
            return URLSearchParamsWrapped();
        }),
    },
    [EXTERNAL_PARAM_SOURCES.SESSION_STORAGE]: {
        // getParamValue: (() => {
        //   return function getParamValue(paramName: string) {
        //     const r = stores.session.get(paramName);
        //     return r ? String(r) : null;
        //   }
        // })(),
        allSourceParams: (() => {
            return stores.session.keys().reduce((acc, curr) => ({
                ...acc,
                [curr]: stores.session.get(curr)
            }), {});
        })
    },
    [EXTERNAL_PARAM_SOURCES.LOCAL_STORAGE]: {
        // getParamValue: (() => {
        //   return function getParamValue(paramName: string) {
        //     const r = stores.local.get(paramName);
        //     return r ? String(r) : null;
        //   }
        // })(),
        allSourceParams: (() => {
            return stores.local.keys().reduce((acc, curr) => ({
                ...acc,
                [curr]: stores.local.get(curr)
            }), {});
        })
    },
    [EXTERNAL_PARAM_SOURCES.THIS_SCRIPT]: {
        allSourceParams: (() => {
            const currScript = getCurrentScript();
            return getAllElementAttributes(currScript);
        })
    }
};
function selectFirstInputSource(param, currentValue = null) {
    const config = EIP_CONFIG[param];
    const paramName = config.nameWords.join("");
    const paramName2 = config.nameWords.join("_").toUpperCase();
    const groupLabel = `inputSourceSelect ➔ get value of ${paramName}.`;
    internalDebugGroup(true, groupLabel);
    internalDebug(`argument param: ${param}, uppercase join of nameWords: ${paramName2}`);
    const strSources = toCoordNP(config.availableSourcesSorted
        .map(src => src.toLowerCase().replaceAll(/(?<=_)(.)/gi, (_, m) => m.toUpperCase()))
        .map(src => src.charAt(0).toUpperCase() + src.slice(1)));
    internalDebug(`${paramName}'s available sources are: ${strSources}.`);
    // Always search sources first
    for (let sourceKey of config.availableSourcesSorted) {
        const source = INPUT_SOURCES[sourceKey];
        internalDebug(`Looking in ${sourceKey}`);
        Object.entries(source.allSourceParams()).forEach(([key, value]) => {
            internalDebug(`⤷ ${key} = ${value}`);
        });
        const foundValue = findAttrMatchWords(config.nameWords, source.allSourceParams());
        if (foundValue) {
            internalDebug(`Param:${paramName2} was found ✅ in Source:${sourceKey} with value:${foundValue}.`);
            internalDebugGroup(false, "1 " + groupLabel);
            return String(foundValue);
        }
        else {
            internalDebug(`Param:${paramName2} isn't in ${sourceKey}.`);
        }
    }
    internalDebug(`Param:${paramName2} was not found ❌ in all sources.`);
    // If not found, use currentValue if provided and valid, else default
    if (currentValue !== null && currentValue !== undefined) {
        try {
            validateRequired({ [param]: currentValue }, param);
            internalDebug(`Param:${paramName2} was set to provided currentValue '${currentValue}'.`);
            internalDebugGroup(false, "3 " + groupLabel);
            return currentValue;
        }
        catch (e) { }
    }
    // Fall back to default if exists
    if ('defaultValue' in config) {
        internalDebug(`Param:${paramName2} was set to fallback default value '${config.defaultValue}'.`);
        internalDebugGroup(false, "4 " + groupLabel);
        return config.defaultValue;
    }
    internalDebug(`Param:${paramName2} has no default value, no current value, and isnt' in any source.`);
    internalDebugGroup(false, "5 " + groupLabel);
    return null;
}
function getAllInputSources() {
    const EIPs = Object.keys(EIP_CONFIG);
    const eipWithValues = {};
    for (const paramName of EIPs) {
        const paramValue = selectFirstInputSource(paramName);
        eipWithValues[paramName] = paramValue == null ? null : paramValue;
    }
    return eipWithValues;
}
const scriptElmTiedParams = Object.entries(EIP_CONFIG)
    .map(([key, value]) => ({ ...value, keyName: key }))
    .filter((aggVal) => aggVal.availableSourcesSorted.includes("THIS_SCRIPT"))
    .map((aggVal) => aggVal.keyName);
class _ParamSource {
    API_KEY = "";
    CAMPAIGN_ID = "";
    BASE_URL = EIP_CONFIG.BASE_URL.defaultValue ?? "";
    TRACE_ID = EIP_CONFIG.TRACE_ID.defaultValue ?? "";
    TTY_LEVEL = EIP_CONFIG.TTY_LEVEL.defaultValue ?? "";
    CHECKOUT_URL = EIP_CONFIG.CHECKOUT_URL.defaultValue ?? "";
    ttylvl = 0;
    utmSource = null;
    constructor() { }
    update() {
        Object.entries(getAllInputSources()).forEach(([key, value]) => {
            this[key] = value;
        });
        if (!isNaN(Number(this.TTY_LEVEL))) {
            this.ttylvl = Number(this.TTY_LEVEL);
        }
        else {
            this.ttylvl = TTY_LEVELS[this.TTY_LEVEL.toLowerCase()] || 0;
        }
        this.updateUtmSource();
    }
    updateUtmSource() {
        internalDebugGroup(true, "inputSourceSelect ➔ utm_source");
        internalDebug(`UTM_Src: request to be updated`);
        const urlUtmSrc = parseUtmSource();
        if (urlUtmSrc?.traceId && urlUtmSrc.apiKey) {
            this.TRACE_ID = urlUtmSrc.traceId;
            this.API_KEY = urlUtmSrc.apiKey;
            this.utmSource = `${this.TRACE_ID}::${this.API_KEY}`;
            internalDebug(`UTM_Src: ⬇️ Obtained from URL`, { trace_id: this.TRACE_ID, api_key: this.API_KEY });
        }
        else {
            internalDebug(`UTM_Src: Not found in URL`);
            if (this.TRACE_ID && this.API_KEY) {
                this.utmSource = `${this.TRACE_ID}::${this.API_KEY}`;
                internalDebug(`UTM_Src: ⚙️ Requirements to generate new utm_source are met`);
                internalDebug(`UTM_Src: ✅ New utm_source: ${this.utmSource}`);
            }
            else {
                this.utmSource = null;
                let strErr = toCoordNP(['TRACE_ID', 'API_KEY'].filter((nm) => Boolean(this[nm]) == false));
                strErr = strErr + " " + (strErr.length === 1 ? "is" : "are");
                internalDebug(`UTM_Src: can't generate new utm_source when ${strErr} empty.`);
            }
        }
        internalDebugGroup(false, "inputSourceSelect ➔ utm_source");
    }
    updateParamsThatMightNotHaveReadFromScriptElm() {
        const valuesYetNotFound = scriptElmTiedParams.filter(keyName => this[keyName] === undefined);
        valuesYetNotFound.forEach(keyName => this.refresh(keyName));
        const valuesThatHaveBeenFound = valuesYetNotFound.map(keyName => [keyName, this[keyName]]).filter(val => val[1] != undefined);
        if (valuesThatHaveBeenFound.length > 0) {
            const strDebug = toCoordNP(valuesThatHaveBeenFound.map(x => String(x[1])));
            internalDebug(`( ! ) updateParamsThatMightNotHaveReadFromScriptElm has found values for ${strDebug}`);
        }
    }
    updateScriptTiedParamIfNeeded(paramName) {
        const tiedToScriptElm = EIP_CONFIG[paramName].availableSourcesSorted.includes("THIS_SCRIPT");
        if (tiedToScriptElm) {
            let previousValue = this[paramName];
            this.refresh(paramName);
            if (previousValue !== this[paramName]) {
                internalDebug(`( ! ) Update Script Tied Param If Needed - this was useful!`);
            }
        }
    }
    refresh(paramName, force = false) {
        let paramValue = selectFirstInputSource(paramName, force ? undefined : this[paramName]);
        //@ts-ignore
        if (!paramValue)
            paramValue = EIP_CONFIG[paramName].defaultValue;
        if (!paramValue)
            paramValue = "";
        this[paramName] = paramValue;
    }
    asObject() {
        // this.updateParamsThatMightNotHaveReadFromScriptElm()
        this.update();
        const myself = this;
        const proxiedSelf = new Proxy({}, {
            get(_, prop) {
                switch (prop) {
                    case "apiKey": return myself.getApiKey();
                    case "campaignId": return myself.getCampaignId();
                    case "baseUrl": return myself.getBaseUrl();
                    case "traceId": return myself.getTraceId();
                    case "ttyLevel": return myself.getTtyLevel();
                    case "checkoutUrl": return myself.getCheckoutUrl();
                    case "utmSource": return myself.getUtmSource();
                    default: return undefined;
                }
            },
            set(_, prop, val) {
                switch (prop) {
                    case "apiKey":
                        myself.API_KEY = val;
                        return true;
                    case "campaignId":
                        myself.CAMPAIGN_ID = val;
                        return true;
                    case "baseUrl":
                        myself.BASE_URL = val;
                        return true;
                    case "traceId":
                        myself.TRACE_ID = val;
                        return true;
                    case "ttyLevel":
                        myself.TTY_LEVEL = val;
                        return true;
                    case "checkoutUrl":
                        myself.CHECKOUT_URL = val;
                        return true;
                    case "utmSource":
                        myself.utmSource = val;
                        return true;
                    default: return false;
                }
            }
        });
        return proxiedSelf;
    }
    getApiKey() {
        // console.trace(`Asked for API_KEY "${this.API_KEY}`)
        // this.updateScriptTiedParamIfNeeded("API_KEY");
        return this.API_KEY;
    }
    setApiKey(val) { if (val) {
        this.API_KEY = val;
    } }
    getCampaignId() {
        // console.trace(`Asked for CAMPAIGN_ID "${this.CAMPAIGN_ID}`)
        // this.updateScriptTiedParamIfNeeded("CAMPAIGN_ID");
        return this.CAMPAIGN_ID;
    }
    setCampaignId(val) { if (val) {
        this.CAMPAIGN_ID = val;
    } }
    getBaseUrl() {
        // this.updateScriptTiedParamIfNeeded("BASE_URL");
        return this.BASE_URL;
    }
    setBaseUrl(val) { if (val) {
        this.BASE_URL = val;
    } }
    getTraceId() {
        // console.trace(`Asked for TRACE_ID "${this.TRACE_ID}`)
        // this.updateScriptTiedParamIfNeeded("TRACE_ID");
        return this.TRACE_ID;
    }
    setTraceId(val) { if (val) {
        this.TRACE_ID = val;
    } }
    getTtyLevel() {
        // this.updateScriptTiedParamIfNeeded("TTY_LEVEL");
        return this.TTY_LEVEL;
    }
    setTtyLevel(val) { if (val) {
        this.TTY_LEVEL = val;
    } }
    getCheckoutUrl() {
        // this.updateScriptTiedParamIfNeeded("CHECKOUT_URL");
        return this.CHECKOUT_URL;
    }
    setCheckoutUrl(val) { if (val) {
        this.CHECKOUT_URL = val;
    } }
    // console levels
    getCanTTY(argLogLevel) {
        let logLevel = argLogLevel;
        if (typeof logLevel === "string") {
            logLevel = TTY_LEVELS[logLevel];
        }
        if (isNaN(+logLevel) || logLevel == null) {
            internalDebug(`Attemp to check if can log invalid log level '${logLevel}'`);
            return false;
        }
        const canLog = this.ttylvl >= logLevel;
        if (!canLog) {
            internalDebug(`Attempt to log '${logLevel}' denied, current ttyLvl: '${this.ttylvl}'.`);
            return false;
        }
        return true;
    }
    static _instance;
    static get instance() {
        return this._instance ??= new _ParamSource();
    }
    getSelf() {
        return this;
    }
    getUtmSource() {
        if (!this.utmSource) {
            this.refresh("API_KEY");
            this.refresh("TRACE_ID");
            this.updateUtmSource();
        }
        return this.utmSource;
    }
}
const ParamSource = _ParamSource.instance;
/* harmony default export */ const inputSourceSelect = (ParamSource);

;// ./src/functions/log.ts



// TODO: unused TextManipulator
class TextManipulator {
    api;
    constructor(api = (text) => text) {
        this.api = api;
    }
    prefix(name) {
        const { api } = this;
        return new TextManipulator(addFix({ prefix: name, api }));
    }
}
var intercept;
(function (intercept) {
    function before(fn, interceptor) {
        return (...a) => fn(...interceptor(...a));
    }
    intercept.before = before;
    function after(fn, interceptor) {
        return (...a) => interceptor(fn(...a));
    }
    intercept.after = after;
})(intercept || (intercept = {}));
function addFix({ prefix = "", suffix = "", api = (text) => text }) {
    return (text) => `${prefix}${api(text)}${suffix}`;
}
const LevelColors = {
    error: ["#ff4d4f", "#2a0000"],
    warn: ["#ffcc00", "#2a2300"],
    info: ["#29e3c0", "#0f2220"],
    group: ["inherit", "inherit"],
    groupCollapsed: ["inherit", "inherit"],
    groupEnd: ["inherit", "inherit"],
    log: ["#cccccc", "#1e1e1e"],
    debug: ["#7cf17c", "#0f210f"],
    trace: ["#9ba3ae", "transparent"],
};
/**
 * Console[.log][.error][.info][.debug][etc] replacement, controlled by source param flags that enable it.
 */
const log_trkiout = (() => {
    const methods = Object.keys(TTY_LEVELS);
    const identity = (...args) => { };
    const safeVoid = new Proxy({}, {
        get() {
            return identity;
        }
    });
    // is [console] object available?
    try {
        if (!console)
            return safeVoid;
        for (let method of methods) {
            if (!(typeof console[method] === "function")) {
                internalDebug(`trkiout → ${console[method]} is not a function`);
                return safeVoid;
            }
            ;
        }
    }
    catch (e1) {
        internalDebug(`trkiout → failed E1:`, e1);
        try {
            if (inputSourceSelect.getCanTTY("error")) {
                console.error("[Traki] Failed to verify console compatibility: ", e1);
            }
        }
        catch (e2) {
            internalDebug(`trkiout → can not console error at all`, e2);
            // can't console.error at all
        }
        return safeVoid;
    }
    // internalDebug(`trkiout → Passed Safeguard 1`);
    // console wrapper
    return new Proxy({}, {
        get(_, prop) {
            // internalDebug(`trkiout.${prop} → ${typeof prop === "string"}, ${methods.includes(prop)}, ${!!console[prop]}, ${ParamSource.getCanTTY(prop)}`)
            if (typeof prop !== "string")
                return identity;
            // trkiout.[error|warn|log|info|debug|trace] only
            if (!methods.includes(prop))
                return identity;
            // double check
            const logType = console[prop];
            if (!logType)
                return identity;
            // does it have permission to log?
            const canLog = inputSourceSelect.getCanTTY(prop);
            if (!canLog)
                return identity;
            const [fg, bg] = LevelColors[prop];
            const style = `color:${fg}; background:${bg}; padding:1px 4px; border-radius:4px; font-weight:600; letter-spacing: 0.5px`;
            // yes i can log that.
            // internalDebug(`trkiout → Passed Safeguard 2`);
            return (...args) => {
                // let me prefix some stuff:
                if (typeof args[0] === "string") {
                    args[0] = `%c[TRAKI]%c ${args[0]}`;
                }
                else {
                    args = ['%c[TRAKI]%c', ...args];
                }
                args = [args[0], style, "", ...args.slice(1)];
                //and log it.
                logType(...args);
            };
        }
    });
})();

;// ./src/functions/agnostic.ts

const parseDichotomy = (() => {
    const truePoles = ["false", "close", "wrong", "dead", "absent", "positiv"];
    const trueExactPoles = ["y", "1", "sim", "one", "um"];
    const falsePoles = ["true", "open", "right", "alive", "present", "unknown", "null", "undefined", "negativ", "nope", "zero"];
    const falseExactPoles = ["n", "0", "on", "não", "nao"];
    return function _parseDichotomy(pole) {
        const strPole = String(pole).toLowerCase();
        if (!strPole || strPole?.length < 1)
            return false;
        if (trueExactPoles.some(tep => strPole.localeCompare(tep) === 0)) {
            return true;
        }
        if (falseExactPoles.some(fep => strPole.localeCompare(fep) === 0)) {
            return false;
        }
        if (truePoles.some(tp => strPole.startsWith(tp))) {
            return true;
        }
        if (falsePoles.some(fp => strPole.startsWith(fp))) {
            return false;
        }
        return false;
    };
})();
/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Debug function for when trkiout isnt available
 */
function internalDebugGroup(open, label) {
    // TODO: if (SOME_GLOBAL_ENVIRONMENT_FLAG_OR_WHATEVER) { console.debug(...arguments); }
    try {
        if (open) {
            // console.log(">>> " + (open ? "open" : "close") +  " " + label);
            console.groupCollapsed(label);
        }
        else {
            console.groupEnd();
            // console.log(">>> " + (open ? "open" : "close") +  " " + label);
        }
    }
    catch (e) {
        console.error(e);
    }
}
/**
 * Debug function for when trkiout isnt available
 */
function internalDebug(...args) {
    // TODO: if (SOME_GLOBAL_ENVIRONMENT_FLAG_OR_WHATEVER) { console.debug(...arguments); }
    let inDebugSign = "%c[IN-DEBUG]%c";
    let argumentZero = args[0];
    let restArgs = args.slice(1);
    let finalArgs = [];
    let isArg0vip = false;
    if (typeof argumentZero === "string") {
        argumentZero = `${inDebugSign} ${argumentZero}`;
    }
    else {
        finalArgs = [inDebugSign, argumentZero, restArgs];
        isArg0vip = true;
    }
    const style = "color:#3c3c3c; background:#BCD; padding:1px 4px; border-radius:4px; font-weight:600; letter-spacing:0.5px;";
    finalArgs = [...(isArg0vip ? [inDebugSign] : []), argumentZero, style, "", restArgs];
    let strCrumb = "";
    if (false) // removed by dead control flow
{}
    console.debug(...finalArgs);
}
/**
 * Gets a debounced version of a function.
 *
 * Debounce be like:
 * const dbncdFunc = getDebouncedFn(func);
 * dbncdFunc();
 * dbncdFunc();
 * dbncdFunc();
 * // 134 ms later:
 * dbncdFunc();
 * // 380 ms later:
 * dbncdFunc();
 * ...
 * // 400ms later:
 * func() is executed
 *
 *
 * // 490 ms later:
 * dbncdFunc()
 *
 * // 890ms later:
 * func() is executed
 */
function getDebouncedFn(func, delay = 400) {
    let timeout;
    return function (...args) {
        const ctx = this;
        clearTimeout(timeout);
        return new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
                try {
                    resolve(func.apply(ctx, args));
                }
                catch (err) {
                    reject(err);
                }
            }, delay);
        });
    };
}
function getAllCookiesObj() {
    let cookies = [];
    try {
        cookies = document.cookie.split(";");
    }
    catch (e) {
        trkiout.error("Error when trying to get document.cookies", e);
    }
    const cookiesObj = {};
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        cookiesObj[key.trim()] = value;
    }
    return cookiesObj;
}
function getAllElementAttributes(element) {
    let res = {};
    const attrs = element?.attributes;
    if (attrs) {
        try {
            for (const atribute of attrs) {
                res[atribute.name] = atribute.value;
            }
        }
        catch (err) {
            log_trkiout.error("Failed to iterate all attributes of element", element);
            log_trkiout.trace(err);
        }
    }
    return res;
}
/**
 * To Corrdinated Noun Phrase
 * Join a list of terms using seralized commas, but join them with the last
 * by connecting them with a conjunction term, like "or".
 * @param {string[]} list A list of words, like ["oranges", "apples", "bananas"].
 * @param {boolean|string} [isDisjunctive=false]
 *    false 🠚 "and", true 🠚 "or".
 *    This argument defines wether the items in the list define a set of different
 *    possibilities, aka an disjunctive list (and it should use the conjunction "or"),
 *    or if the terms are an aggregation, combination or conjuction of items, aka
 *    an conjunctive list (and then it should use the conjunction "and").
 *    Should you desire another kind of conjunction, like "nor", provide a string.
 * @param {boolean} [useOxfordComma=false]
 *    automatically applied when the provided list is exactly three terms.
 *    false: "we invited the doctors, trump  and obama" 🠚 there are two doctors
 *    true:  "we invited the doctors, trump, and obama" 🠚 two presidents
 *    Although this solves a specific case of ambiguity, in most of the scenarios
 *    it is not needed.
 * @returns {string} "oranges, apples and bananas"
 */
function toCoordNP(list, isDisjunctive = false, useOxfordComma = undefined) {
    if (!list)
        return "";
    const words = (Array.isArray(list) && list.length !== null ? list : [])
        .filter(word => word != null)
        .map(word => typeof word.toString === "function" ? word.toString() : String(word));
    if (words.length === 0)
        return "";
    if (words.length === 1)
        return words[0];
    if (words.length === 2)
        return words[0] + " and " + words[1];
    if (words.length === 3 && useOxfordComma === null || useOxfordComma === undefined)
        useOxfordComma = true;
    const commaWords = list.slice(0, -1).join(", ");
    const conjuction = typeof isDisjunctive === "string" ? isDisjunctive : ((["and", "or"])[+!!isDisjunctive]);
    return [
        commaWords,
        useOxfordComma ? ", " : " ",
        conjuction + " ",
        words[words.length - 1],
    ].join("");
}
function areWordsEqual(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
const matchAnyCaseBoundaries = new RegExp("("
    + "[^a-z0-9A-Z\n]+" // anything▮▮▮between▮▮▮ANY▮▮▮cAsE▮▮▮Words
    + "|" + "(?<=[a-z])(?:\b|\B)(?=[A-Z][a-z]+)" // boundary▮Of▮This▮Case
    + "|" + "(?<=[a-z]{2,})(?:\b|\B)(?=[A-Z]{2,})" // lowercase▮UPPERCASE
    + "|" + "(?<=[A-Z]{2,})(?:\b|\B)(?=[a-z]{2,})" // UPPERCASE▮lowercase
    + ")", "g");
const uniqueSeparator = "｜"; // Fullwidth Vertical Bar
function findAttrMatchWords(paramWords, attributes) {
    let counter = [];
    for (const [attrName, attrValue] of Object.entries(attributes)) {
        const stripData = attrName.replace(/^data./gi, "");
        const attrNameMarked = stripData.replaceAll(matchAnyCaseBoundaries, uniqueSeparator);
        const attrWords = attrNameMarked.split(uniqueSeparator);
        const normalizedKeyWords = attrWords.map(word => word.toLowerCase());
        const isWordsEqual = areWordsEqual(normalizedKeyWords, paramWords);
        if (isWordsEqual) {
            internalDebug(`Tried all these: ${counter.join(", ")} but none match with ${paramWords.join("")}.`);
            const debugObj = { attrName, attrValue, attrNameMarked, attrWords, normalizedKeyWords };
            internalDebug("found!", debugObj);
            return attrValue;
        }
        else {
            counter.push(attrName);
            if (counter.length > 10) {
                internalDebug(`Tried all these: ${counter.join(", ")} but none match with ${paramWords.join("")}.`);
                counter = [];
            }
        }
    }
    return undefined;
}
function copyDataset(el) {
    const obj = {};
    if (!el || !el.dataset)
        return obj;
    for (const k in el.dataset)
        obj[k] = el.dataset[k];
    return obj;
}
function getDomPath(el) {
    const parts = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
        let name = el.nodeName.toLowerCase();
        let id = el.id ? "#" + el.id : "";
        let cls = el.className && typeof el.className === "string"
            ? "." + el.className.trim().split(/\s+/).join(".")
            : "";
        let index = 1;
        let sib = el.previousElementSibling;
        while (sib) {
            if (sib.nodeName === el.nodeName)
                index++;
            sib = sib.previousElementSibling;
        }
        const nth = index > 1 ? `:nth-of-type(${index})` : "";
        parts.unshift(name + id + cls + nth);
        el = el.parentElement;
    }
    return parts.join(">");
}
function getTextPreview(el, max = 200) {
    if (!el)
        return "";
    const t = el.textContent || "";
    const trimmed = t.replace(/\s+/g, " ").trim();
    return trimmed.length > max ? trimmed.slice(0, max) + "…" : trimmed;
}
function getNetworkInfo() {
    const c = navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
    if (!c)
        return null;
    return {
        type: c.type || null,
        effectiveType: c.effectiveType || null,
        downlink: typeof c.downlink === "number" ? c.downlink : null,
        rtt: typeof c.rtt === "number" ? c.rtt : null,
        saveData: !!c.saveData
    };
}
/**
 * Turns a glob pattern to an actual regexp of that glob.
 *
 * @param pattern glob string
 * @returns RegExp of the glob
 */
function globToRegex(pattern) {
    let rxPatrn = pattern
        .replace(/([.?+^$[\]\\(){}|\/-])/g, "\\$1")
        .replace(/\*/g, '.*');
    return new RegExp(rxPatrn);
}
function compileUrlStrings(patternList) {
    return patternList
        .split(",")
        .map(p => p.trim())
        .filter(Boolean);
}
function compileUrlPatterns(patternList) {
    try {
        return patternList
            .split(",")
            .map(p => p.trim())
            .filter(Boolean)
            .map(globToRegex);
    }
    catch (err) {
        log_trkiout.error(err);
        return [];
    }
}
function matchUrlPatterns(compiled, url) {
    for (const re of compiled)
        if (re.test(url))
            return true;
    return false;
}

;// ./src/functions/listenOutbound.ts

// =========================
//   MUTATION OBSERVER (links)
//   auto-UTM all anchors, existing + dynamic
// =========================
const ATTR_ELM_PATCHED = "data-traki-ed";
const ATTR_ELM_ORIGINAL_URL = "data-traki-og";
let previousURL = location.href;
function getPreviousURL() {
    const out = previousURL;
    previousURL = location.href;
    return out;
}
function listenOutbounds(urlEventParams) {
    log_trkiout.groupCollapsed("Listen to outbound events");
    setupLinkMutationObserver(urlEventParams);
    listenToAnchorClick(urlEventParams);
    listenToSubmit(urlEventParams);
    listenToPopState(urlEventParams);
    listenToUnload(urlEventParams);
    listenToNavigate(urlEventParams);
    log_trkiout.groupEnd();
}
// #region Observer
//
function setupLinkMutationObserver({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug("Will listen to DOM changes");
    if (!("MutationObserver" in window)) {
        log_trkiout.error("MutationObserver doesnt exist in window");
        return;
    }
    function processAnchor(a) {
        if (!a || !a.getAttribute)
            return;
        const hrefAttr = a.getAttribute("href");
        if (!hrefAttr)
            return;
        if (!a.hasAttribute(ATTR_ELM_ORIGINAL_URL)) {
            a.setAttribute(ATTR_ELM_ORIGINAL_URL, hrefAttr);
        }
        if (a.getAttribute(ATTR_ELM_PATCHED) === "trakied")
            return;
        try {
            log_trkiout.debug(`Adding UTM to url of new <a href>`);
            const absoluteOriginal = new URL(hrefAttr, location.href).toString();
            const urlWithUTM = getFinalURL(absoluteOriginal);
            if (urlWithUTM !== absoluteOriginal) {
                a.href = urlWithUTM;
            }
            a.setAttribute(ATTR_ELM_PATCHED, "trakied");
        }
        catch {
            // ignore invalid URLs
        }
    }
    // initial pass
    const docLinks = document.querySelectorAll("a[href]");
    docLinks.forEach((aElm) => processAnchor(aElm));
    log_trkiout.debug(`Initially found ${docLinks.length} <a href> in this page.`);
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === "childList") {
                m.addedNodes.forEach((_node) => {
                    const node = _node;
                    if (node.nodeType !== 1)
                        return;
                    if (node.tagName === "A" && node.hasAttribute("href")) {
                        processAnchor(node);
                    }
                    if (node.querySelectorAll) {
                        node.querySelectorAll("a[href]").forEach((aElm) => processAnchor(aElm));
                    }
                });
            }
            else if (m.type === "attributes" &&
                m.attributeName === "href" &&
                m.target.tagName === "A") {
                processAnchor(m.target);
            }
        }
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"]
    });
    log_trkiout.debug("Listener for DOM Changes deployed.");
}
//
// #endregion Observer
// =============================================================================
// #region Evt_Click
//
function listenToAnchorClick({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug(`Will listen to <a href> clicks`);
    document.addEventListener("click", (e) => {
        const a = e.target && typeof e.target.closest === "function" && e.target.closest("a[href]");
        if (!a)
            return;
        const domHref = a.getAttribute("href");
        log_trkiout.debug(`There was a click in one of the observed anchor elements: <a href="${domHref || "??"}">`);
        const originalHref = a.getAttribute(ATTR_ELM_ORIGINAL_URL) || domHref || a.href;
        let absoluteOriginal;
        try {
            absoluteOriginal = new URL(originalHref, location.href).toString();
        }
        catch {
            absoluteOriginal = originalHref;
        }
        const hrefWithUTM = getFinalURL(absoluteOriginal);
        a.href = hrefWithUTM;
        dispatchEvent("linkclick", absoluteOriginal, {
            href: hrefWithUTM,
            originalHref,
            domHref,
            // target: a.target || "_self",
            // domPath: getDomPath(a),
            // text: getTextPreview(a),
            // dataset: copyDataset(a),
            modifiers: {
                ctrl: e.ctrlKey,
                meta: e.metaKey,
                shift: e.shiftKey,
                alt: e.altKey,
                button: e.button
            }
        });
    });
    log_trkiout.debug(`Listener for anchor clicks deployed/`);
}
;
//
// #endregion Evt_Click
// =============================================================================
// #region Evt_Form
//
function listenToSubmit({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug(`Will listen to form submission events`);
    document.addEventListener("submit", (e) => {
        const formElm = e.target;
        if (!formElm || !formElm.action)
            return;
        log_trkiout.debug(`There was a submission of a form: action="${formElm.action}"`);
        const originalAction = formElm.action;
        const feAction = getFinalURL(originalAction);
        formElm.action = feAction;
        dispatchEvent("FormSubmit", originalAction, {
            action: feAction,
            originalAction,
            method: (formElm.method || "GET").toUpperCase(),
            // domPath: getDomPath(formElm),
            // dataset: copyDataset(formElm)
        });
    });
    log_trkiout.debug(`Listener for Form Submissions deployed`);
}
//
// #endregion Evt_Form
// =============================================================================
// #region PopState
//
function listenToPopState({ getFinalURL, dispatchEvent }) {
    window.addEventListener("popstate", (e) => {
        log_trkiout.debug(`An history state has been popped.`);
        dispatchEvent("PopState", getPreviousURL(), e.state);
    });
    log_trkiout.debug(`Listener for PopState deployed`);
}
//
// #endregion PopState
// =============================================================================
// #region Evt_Unload
//
function listenToUnload({ getFinalURL, dispatchEvent }) {
    window.addEventListener("beforeunload", () => {
        log_trkiout.debug(`Page is about to be unloaded.`);
        dispatchEvent("BeforeUnload", location.href);
    });
    window.addEventListener("unload", () => {
        log_trkiout.debug(`Unloading page`);
        dispatchEvent("OnUnload", location.href);
    });
    log_trkiout.debug(`Listener for [Before]Unload deployed`);
    // document.addEventListener("visibilitychange", () => {
    //   dispatchEvent("VisibilityChange", { state: document.visibilityState } as any);
    // });
}
//
// #endregion PopState
// =============================================================================
// #region Evt_Unload
//
function listenToNavigate({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug(`Will listen to navgation events`);
    // polyfill();
    if (window.navigation)
        return listenToNavigation();
    window.addEventListener('navigationReady', listenToNavigation);
    function listenToNavigation() {
        let lastURL;
        window.navigation?.addEventListener("navigate", (event) => {
            log_trkiout.log("an Navigate event happened", event, event.destination.url, lastURL);
            const navigation = window.navigation;
            if (!event?.destination?.url) {
                log_trkiout.debug(`Navigation event has no destination URL.`);
                return;
            }
            ;
            try {
                event.destination.url = event?.destination?.url?.href ?? event?.destination?.url;
            }
            catch (e) {
                log_trkiout.debug(`Error trying to get navigation event's destination URL value.`);
            }
            if (lastURL == event.destination.url) {
                log_trkiout.debug(`Event's destination URL is already patched.`);
                return;
            }
            ;
            event.preventDefault();
            log_trkiout.debug(`Prevented original navigation`);
            const url = getFinalURL(event.destination.url);
            // dispatchEvent(url, "Navigate"+event.navigationType)
            const shouldRefresh = !event.destination.sameDocument;
            lastURL = url;
            if (shouldRefresh) {
                log_trkiout.debug(`Will navigate to patched url`);
                return navigation.navigate(url, {
                    history: event.navigationType === 'push'
                        ? 'push'
                        : (event.navigationType === 'replace' ? 'replace' : 'auto')
                });
            }
            else {
                log_trkiout.debug(`Navigation destiny is same document, will pushState instead`);
            }
            history.pushState({}, '', url);
        });
    }
    log_trkiout.debug(`Listener for Navigation Events deployed`);
}
//
// #endregion Evt_Unload

;// ./src/functions/patchToIntercept.ts

// =============================================================================
// #region Helpers
//
// function getFinalURL(destinyURL?: string | URL): string {
//   return addUTM(destinyURL);
// }
// function dispatchEvent(type: string, destinyURL?: string | URL, args?: unknown[]): void {
//   trkiout.log(`Dispatch Event from intercepted method: ${type}, ${destinyURL}, ${(args||[]).join(", ")}`);
//   return;
// }
//
// #endregion Helpers
// =============================================================================
// #region Intercept
//
function patchIntercept(urlEventParams) {
    log_trkiout.groupCollapsed("Patch global methods by Intercept");
    try {
        patchWindowOpen(urlEventParams);
    }
    catch (e) {
        log_trkiout.trace(`Failed to patch WindowOpen`, e);
        return e;
    }
    try {
        patchLocation(urlEventParams);
    }
    catch (e) {
        log_trkiout.trace(`Failed to patch Location`, e);
        return e;
    }
    try {
        patchHistory(urlEventParams);
    }
    catch (e) {
        log_trkiout.trace(`Failed to patch History`, e);
        return e;
    }
    log_trkiout.groupEnd();
}
//
// #endregion Intercept
// =============================================================================
// #region WindowOpen
//
function patchWindowOpen({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug("Patching window.open()");
    const orig = window.open;
    if (!orig) {
        log_trkiout.error("Failed to patch window.open because there's no 'open'");
        return;
    }
    window.open = function (_url, target, features) {
        const payload = { target, features };
        dispatchEvent("WindowOpen", _url, payload);
        return orig.call(this, getFinalURL(_url), target, features);
    };
    log_trkiout.debug("Patched window.open.");
}
//
// #endregion WindowOpen
// =============================================================================
// #region Location
//
// function patchLocation({ getFinalURL, dispatchEvent }: UrlEventParams) {
//   const proto = Object.getPrototypeOf(window.location);
//   const desc = Object.getOwnPropertyDescriptor(proto, "href");
//   if (desc && desc.configurable && desc.set && desc.get) {
//     Object.defineProperty(proto, "href", {
//       set(_url) {
//         dispatchEvent("LocationHrefSet", _url);
//         if (typeof desc.set === "function") {
//           return desc.set.call(this, getFinalURL(_url));
//         }
//       },
//       get() {
//         return desc.get!.call(this);
//       }
//     });
//   }
//   function wrap(name: "assign" | "replace") {
//     const orig = location[name];
//     if (typeof orig !== "function") return;
//     location[name] = function (_url: string) {
//       dispatchEvent(`Location${name.charAt(0)+name.slice(1)}`, _url);
//       return orig.call(this, getFinalURL(_url))
//     }
//   }
//   wrap("assign");
//   wrap("replace");
// };
/**
 * Intercepts window.location.href and related methods to add utm_source
 * Uses multiple strategies to ensure coverage across different browsers and scenarios
 */
function patchLocation({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug("Patching location.href, location.assign, location.replace");
    let intercepted = false;
    // Strategy 1: Try to intercept Location.prototype.href setter (most comprehensive)
    try {
        const originalDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
        if (originalDescriptor && originalDescriptor.set && originalDescriptor.configurable) {
            const originalSetter = originalDescriptor.set;
            Object.defineProperty(Location.prototype, 'href', {
                set: function (url) {
                    try {
                        const destinyUrl = getFinalURL(url);
                        log_trkiout.debug(`[window.location.href] Intercepted: ${url} → ${destinyUrl}`);
                        dispatchEvent("LocationSet", url);
                        originalSetter.call(this, destinyUrl);
                        // const urlObj = new URL(url, window.location.origin);
                        // if (!urlObj.searchParams.has(UTM_SOURCE_ID_PARAM)) {
                        //   urlObj.searchParams.set(UTM_SOURCE_ID_PARAM, utmSource);
                        //   const finalUrl = urlObj.toString();
                        //   trkiout.debug(`[window.location.href] Intercepted: ${url} → ${finalUrl}`);
                        //   originalSetter.call(this, finalUrl);
                        // } else {
                        //   trkiout.debug(`[window.location.href] Already has utm_source: ${url}`);
                        //   originalSetter.call(this, url);
                        // }
                    }
                    catch (error) {
                        log_trkiout.debug('[window.location.href] Interception failed:', error);
                        originalSetter.call(this, url);
                    }
                },
                get: originalDescriptor.get,
                enumerable: true,
                configurable: true
            });
            intercepted = true;
            log_trkiout.log('✅ window.location.href setter intercepted (Location.prototype)');
        }
    }
    catch (error) {
        log_trkiout.debug('Failed to intercept Location.prototype.href:', error);
    }
    // Strategy 2: Intercept window.location.assign (fallback/additional)
    try {
        const originalAssign = window.location.assign;
        window.location.assign = function (url) {
            try {
                const destinyUrl = getFinalURL(url);
                log_trkiout.debug(`[window.location.assign] Intercepted: ${url} → ${destinyUrl}`);
                dispatchEvent("LocationAssign", url);
                originalAssign.call(this, destinyUrl);
                // const urlObj = new URL(url, window.location.origin);
                // if (!urlObj.searchParams.has(UTM_SOURCE_ID_PARAM)) {
                //   urlObj.searchParams.set(UTM_SOURCE_ID_PARAM, utmSource);
                //   const finalUrl = urlObj.toString();
                //   trkiout.debug(`[window.location.assign] Intercepted: ${url} → ${finalUrl}`);
                //   return originalAssign.call(this, finalUrl);
                // }
                // return originalAssign.call(this, url);
            }
            catch (error) {
                log_trkiout.debug('[window.location.assign] Interception failed:', error);
                return originalAssign.call(this, url);
            }
        };
        log_trkiout.log('✅ window.location.assign intercepted');
    }
    catch (error) {
        log_trkiout.debug('Failed to intercept window.location.assign:', error);
    }
    // Strategy 3: Intercept window.location.replace (fallback/additional)
    try {
        const originalReplace = window.location.replace;
        window.location.replace = function (url) {
            try {
                const destinyUrl = getFinalURL(url);
                log_trkiout.debug(`[window.location.assign] Intercepted: ${url} → ${destinyUrl}`);
                dispatchEvent("LocationReplace", url);
                originalReplace.call(this, destinyUrl);
                // const urlObj = new URL(url, window.location.origin);
                // if (!urlObj.searchParams.has(UTM_SOURCE_ID_PARAM)) {
                //   urlObj.searchParams.set(UTM_SOURCE_ID_PARAM, utmSource);
                //   const finalUrl = urlObj.toString();
                //   trkiout.debug(`[window.location.replace] Intercepted: ${url} → ${finalUrl}`);
                //   return originalReplace.call(this, finalUrl);
                // }
                // return originalReplace.call(this, url);
            }
            catch (error) {
                log_trkiout.debug('[window.location.replace] Interception failed:', error);
                return originalReplace.call(this, url);
            }
        };
        log_trkiout.log('✅ window.location.replace intercepted');
    }
    catch (error) {
        log_trkiout.debug('Failed to intercept window.location.replace:', error);
    }
    if (!intercepted) {
        log_trkiout.warn('⚠️ window.location.href not directly intercepted. Using fallback methods (assign/replace).');
    }
}
//
// #endregion Location
// =============================================================================
// #region History
//
function patchHistory({ getFinalURL, dispatchEvent }) {
    log_trkiout.debug("Patching History");
    function wrap(name) {
        log_trkiout.debug(`Patching history.${name}()`);
        const orig = history[name];
        if (typeof orig !== "function") {
            log_trkiout.error(`Failed to patch history.${name} - not a function`);
            return;
        }
        ;
        history[name] = function (state, title, _url) {
            // trkiout.log(`History.${name}(state, ${title}, ${_url} ⇾ ${getFinalURL(_url as any)})`, state);
            // @ts-ignore
            dispatchEvent(`History${name.charAt(0) + name.slice(1)}`, _url, { state, title });
            return orig.apply(this, [state, title, getFinalURL(_url)]);
        };
        log_trkiout.debug(`Patched history.${name} successfully.`);
    }
    wrap("pushState");
    wrap("replaceState");
}
//
// #endregion History
// =============================================================================

;// ./src/types/api.ts







/**
 * Constructs a normalized URL by concatenating a base URL, version, and path segments.
 * It trims redundant slashes and ignores null/undefined/empty parts.
 *
 * @param {string | (string | number | null | undefined)[]} path
 *   The path string or array of path segments.
 *   When an array is provided, falsy items (`null`, `undefined`, `""`, `false`) are skipped.
 * @param {string | null | undefined} [baseURL=""]
 *   Optional base URL. Falls back to `ParamSource.getBaseUrl()` if falsy.
 * @param {TVersionParam} [version="v1"]
 *   API version prefix (e.g. `"v1"`, `"v2"`). Included in the URL after the base.
 * @returns {string}
 *   A fully composed, slash-normalized URL string.
 *
 * @example
 * getURL("/events")
 * // → "https://example.com/v1/events"
 *
 * @example
 * getURL(["user", userId, "orders", orderId, "products"], API_URLS.orders, "v2")
 * // → "https://orders.api/v2/user/123/orders/456/products"
 *
 * @example
 * getURL("user/123/orders/456/products")
 * // → "https://example.com/v1/user/123/orders/456/products"
 *
 * @example
 * getURL(["products", productId, "images", hasImage && imageId]) ➔ given hasImage is true
 * // → "https://example.com/v1/products/42/images/7"
 *
 * @example
 * getURL(["products", productId, "images", hasImage && imageId]) ➔ when there's no image
 * // → "https://example.com/v1/products/42/images
 */
function getTheURL(path, baseURL = "", version = "v1") {
    const base = baseURL || inputSourceSelect.getBaseUrl();
    const parts = [base, version]
        .concat(Array.isArray(path) ? path : [path])
        .filter(v => v != null && v !== "")
        .map(v => String(v).replace(/^\/+|\/+$/g, ""));
    return parts.join("/");
}
function doRequest(path, data, options = {}) {
    const cfg = {
        maxRetries: 3,
        retryDelay: 1000,
        requestTimeout: 5000,
        method: "POST",
        apiKey: inputSourceSelect.getApiKey(),
        baseUrl: inputSourceSelect.getBaseUrl(),
        omitParams: [],
        ...(options || {}),
    };
    cfg.headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
        ...(options?.headers || {})
    };
    // Separate 'name' from the rest of the data to construct proper payload
    const { name, ...payloadData } = data;
    let requestBody = {
        ...(name ? { name } : {}),
        ...payloadData,
    };
    if (Array.isArray(cfg.omitParams)) {
        log_trkiout.info(`requestBody before omitParams: `, requestBody);
        requestBody = Object.entries(requestBody).reduce((all, [key, value]) => {
            if (!cfg.omitParams?.includes(key)) {
                return { ...all, [key]: value };
            }
            else {
                return all;
            }
        }, {});
        log_trkiout.info(`New requestBody after omitParams: `, requestBody);
    }
    const validInfo = validateStruct(cfg, [
        ["apiKey", validateRequired],
        // ["campaignId", validateUUID]
    ]);
    if (!validInfo.valid) {
        validInfo.fields.forEach(({ field, value, msg }) => log_trkiout.error(msg, value, field));
        return {
            abort: () => { },
            response: new Promise((resolve) => resolve({
                success: false, data: null,
                error: { msg: `Validation failed` }
            }))
        };
    }
    const controllerSignal = new AbortController();
    const url = getTheURL(path, cfg.baseUrl);
    let lastError = null;
    const maxRetries = cfg.maxRetries == null ? 3 : (cfg.maxRetries);
    const retryDelay = cfg.retryDelay == null ? 1000 : (cfg.retryDelay);
    async function waitForResponse() {
        let returnData = { success: false, data: null, error: { msg: "unknown error" } };
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const timeoutSignal = AbortSignal.timeout(cfg.requestTimeout || 5000);
                const rawFetchData = await fetch(url, {
                    method: cfg.method,
                    headers: cfg.headers,
                    body: JSON.stringify(requestBody),
                    signal: AbortSignal.any([controllerSignal.signal, timeoutSignal])
                });
                let res;
                try {
                    res = await rawFetchData.json();
                }
                catch (_e) {
                    try {
                        res = await rawFetchData.text();
                    }
                    catch (e) {
                        res = e;
                    }
                }
                if (rawFetchData.ok) {
                    returnData = { success: true, error: null, data: res, };
                    if (res.data)
                        returnData.data = res.data;
                    if (res.data?.data)
                        returnData.data = res.data.data;
                    return returnData;
                }
                else {
                    if (res.status >= 400 && res.status < 500) {
                        returnData = {
                            success: false,
                            error: { msg: `API request failed with status ${res.status}`, details: res, response: rawFetchData },
                            data: null,
                        };
                    }
                    // Retry on server errors (5xx)
                    lastError = new Error(`Server error: ${res.status}`);
                    if (attempt < maxRetries) {
                        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
                        continue;
                    }
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                // Don't retry on abort/timeout for the last attempt
                if (attempt < maxRetries && !lastError.message.includes('aborted')) {
                    returnData = { success: false, data: null,
                        error: { msg: "DoRequest Failed all retries", details: { lastError, error } }
                    };
                    await sleep(retryDelay * (attempt + 1));
                    continue;
                }
            }
        }
        return returnData;
    }
    const r = {
        abort: () => controllerSignal.abort(),
        response: waitForResponse(),
    };
    return r;
}
/**
 * Record any Event from user interaction.
 *
 * This is the generic event seneder function and should be used as the only way to make requests that are about "create a record" and under the topic "event".
 * @param {string} eventName one of the accepted event names
 * @param {object} eventData object with the data that the event expects to receive.
 * @param {object} options{} Request behavior settings, only necessary in very specific scenarios.
 * @returns The data responded by the server if the request succeeds, or null if it fails.
 */
async function sendEvent(eventName, eventData, options = {}) {
    const validInfo = validateStruct({ eventName, traceId: inputSourceSelect.getTraceId() }, [
        ["eventName", validateRequired],
        ["traceId", validateRequired],
        // ["traceId", validateUUID],
    ]);
    if (!validInfo.valid) {
        validInfo.fields.forEach(({ field, value, msg }) => log_trkiout.error(msg, value, field));
        return new Promise(resolve => resolve(null));
    }
    const currentUrl = window.location.href;
    // Payload (dynamic - can have any fields)
    const payload = {
        // @ts-ignore
        from: lastPageUrl || document.referrer || undefined,
        // @ts-ignore
        to: currentUrl,
        // @ts-ignore
        title: document.title,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
        screen: {
            width: window.screen?.availWidth,
            height: window.screen?.availHeight,
            pxDepth: window.screen?.pixelDepth,
            colDepth: window.screen?.colorDepth,
            orientation: window.screen?.orientation?.type || "unknown",
            // @ts-ignore
            angle: window.screen?.angle || 0,
            // @ts-ignore
            extended: window.screen?.isExtended
        },
        ...(eventData?.payload || {})
    };
    // Update last URL for next navigation
    lastPageUrl = currentUrl;
    // Metadata (strict schema - only allowed fields)
    const metadata = {
        action_source: "WEBSITE",
        user_agent: navigator.userAgent,
        screen_height: window.screen?.availHeight,
        screen_width: window.screen?.availWidth,
        locale: navigator.language,
        page_url: currentUrl,
        page_referrer: document.referrer || undefined,
        ...(eventData?.metadata || {})
    };
    const finalEventData = {
        trace_id: inputSourceSelect.getTraceId(),
        campaign_id: inputSourceSelect.getCampaignId(),
        created_at: new Date().toISOString(),
        name: eventName,
        payload,
        metadata,
    };
    options.apiKey = inputSourceSelect.getApiKey();
    options.baseUrl = inputSourceSelect.getBaseUrl();
    const postulate = doRequest("/events", finalEventData, options);
    const response = await postulate.response;
    if (response.success) {
        return response.data;
    }
    else {
        log_trkiout.error(`Failed to sendEvent ${eventName}: ${response.error.msg}`, { details: response.error.details });
        return null;
    }
}
// Store last URL to track navigation
let lastPageUrl = '';
/**
 * Track page view event
 */
async function trackPageViewCore(navigationMethod, extraData) {
    const currentUrl = window.location.href;
    const from = lastPageUrl || document.referrer || undefined;
    const payload = {
        to: currentUrl,
        from,
        title: document.title,
        navigationMethod,
        ...(extraData || {}),
    };
    const metadata = {};
    const sent = await sendEvent("PageView", { payload, metadata });
    const sentOk = Boolean(sent);
    log_trkiout.log(sentOk ? `Sent PageView: ${from} -> ${currentUrl}` : "Failed to send PageView event");
    return sentOk;
}
const trackPageView = getDebouncedFn(trackPageViewCore, 600);
async function trackCheckoutInitiatedCore(navigationMethod, extraData) {
    const currentUrl = window.location.href;
    const from = lastPageUrl || document.referrer || undefined;
    const payload = {
        to: currentUrl,
        from,
        navigationMethod,
        ...(extraData || {}),
    };
    const sent = await sendEvent("InitCheckout", { payload, metadata: {} });
    const sentOk = Boolean(sent);
    log_trkiout.log(sentOk ? `Sent InitCheckout: ${from} -> ${currentUrl}` : "Failed to send InitCheckout event");
    return sentOk;
}
const trackCheckoutInitiated = getDebouncedFn(trackCheckoutInitiatedCore, 600);
/**
 * Track before redirect event
 */
async function trackBeforeRedirect(from, to) {
    const eventData = { payload: { to, from }, metadata: {} };
    const sent = await sendEvent("BeforeRedirect", eventData);
    const sentOk = Boolean(sent);
    trkiout.log(sentOk ? "Sent event of Redirect successfully" : "Failed to send Redirect event");
    return sentOk;
}
async function trackSelectionChange() {
    const selection = document.getSelection();
    if (selection) {
        const wText = selection?.focusNode?.wholeText;
        let conText = wText.slice(Math.max(0, selection.anchorOffset - 100), Math.min(selection.focusOffset + 100, wText.length));
        let selText = wText.slice(selection.anchorOffset, selection.focusOffset);
        conText = conText.replace(/\s+/g, ' ').trim();
        selText = selText.replace(/\s+/g, ' ').trim();
        const eventData = { payload: { conText, selText }, metadata: {} };
        const sent = await sendEvent("SelectionChange", eventData);
        const sentOk = Boolean(sent);
        trkiout.log(sentOk ? "Sent event of SelectionChange successfully" : "Failed to send SelectionChange event");
        return sentOk;
    }
    return false;
}
// #endregion SelChange
// =============================================================================
// #region New_Trace
/**
 * Create a new trace via API
 */
async function createTrace() {
    const config = inputSourceSelect.asObject();
    log_trkiout.groupCollapsed(`Will createTrace`);
    if (!config.campaignId || !config.apiKey) {
        log_trkiout.error('Cannot create trace: missing campaign_id or api_key');
        return false;
    }
    const srchPWrap = URLSearchParamsWrapped();
    const tracePayload = {
        campaign_id: config.campaignId,
        final_url: window.location.href,
        utm_source: srchPWrap.utm_source,
        utm_medium: srchPWrap.utm_medium,
        utm_campaign: srchPWrap.utm_campaign,
        utm_term: srchPWrap.utm_term,
        utm_content: srchPWrap.utm_content,
        user_agent: navigator.userAgent,
        accept_language: navigator.language,
    };
    log_trkiout.log("tracePayload:", tracePayload);
    const sendEventRequestOptions = {
        ...(config || {}),
        omitParams: ["traceId", "trace_id"],
    };
    const postulate = doRequest("traces", tracePayload, sendEventRequestOptions);
    const res = await postulate.response;
    if (!res.success) {
        log_trkiout.error(`Failed to create trace: ${res?.error?.msg}`, { details: res?.error?.details });
        log_trkiout.groupEnd();
        return false;
    }
    log_trkiout.log(`doRequest('traces') response: `, res.data);
    let createdTraceId = res.data?.trace?.id;
    // @ts-ignore
    // if (!createdTraceId) { createdTraceId = res.data?.data?.trace?.id; }
    try {
        validateRequired({ trace_id: createdTraceId }, "trace_id");
        // validateUUID({ trace_id: createdTraceId}, "trace_id");
    }
    catch (e) {
        if (e instanceof ValidationError) {
            log_trkiout.error(`Validation failed: ${e.message}`, {
                field: e.field,
                value: e.value,
            });
        }
        else {
            log_trkiout.error(`Unknown error when validating`, e);
        }
        log_trkiout.groupEnd();
        return false;
    }
    try {
        stores.session.set(STORAGE_KEYS.TRACE_ID, createdTraceId);
    }
    catch (error) {
        log_trkiout.error("Failed to store trace_id in SESSION_STORAGE", error);
        log_trkiout.groupEnd();
        return false;
    }
    inputSourceSelect.setTraceId(createdTraceId);
    if (inputSourceSelect.getTraceId() === createdTraceId) {
        log_trkiout.debug("ParamSource successfully updated with new trace_id");
        log_trkiout.groupEnd();
        return true;
    }
    else {
        log_trkiout.error(`Trace ID mismatch after creation ParamSource:"${inputSourceSelect.getTraceId()}", Provided by API: "${createdTraceId}"`);
    }
    log_trkiout.groupEnd();
    return false;
}
// #endregion New_Trace
// =============================================================================
// #region End
// #endregion End

;// ./src/export/traki.ts









try {
    Error.stackTraceLimit = 100;
}
catch (e) { }
// TODO: intercept and add utm_source to
// - a[href]
// - window.open
// - form submit
// - redirect
async function traki() {
    // get params from first source where they're available
    const config = inputSourceSelect.asObject();
    log_trkiout.debug([
        " says:",
        "┌┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┐",
        "├┼┼┴┴┴┴┴┴┴┼┼┼┴┴┴┴┴┴┴┼┼┼┴┴┴┴┴┴┴┼┼┼┴┼┼┼┼┴┴┼┼┼┴┴┴┴┴┴┴┼┼┤",
        "├┼┼┬┬┐ ┌┬┬┼┼┤ ┌┬┬┬┐ ├┼┤ ┌┬┬┬┐ ├┼┤ ├┼┼┘ ┬┼┼┼┬┬┐ ┌┬┬┼┼┤",
        "├┼┼┼┼┤ ├┼┼┼┼┤ └┴┴┴┘ ├┼┤ └┴┴┴┘ ├┼┤ ├┘ ┌┼┼┼┼┼┼┼┤ ├┼┼┼┼┤",
        "├┼┼┼┼┤ ├┼┼┼┼┤ ┌┬┐ ─┬┼┼┤ ┌┬┬┬┐ ├┼┤   ─┴┼┼┼┼┼┼┼┤ ├┼┼┼┼┤",
        "├┼┼┼┼┤ ├┼┼┼┼┤ ├┼┼┐ └┼┼┤ ├┼┼┼┤ ├┼┤ ├┼┬  └┼┼┼┴┴┘ └┴┴┼┼┤",
        "├┼┼┼┼┼┬┼┼┼┼┼┼┬┼┼┼┼┬┬┼┼┼┬┼┼┼┼┼┬┼┼┼┬┼┼┼┼┼┬┼┼┼┬┬┬┬┬┬┬┼┼┤",
        "└┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┘"
    ].join("\n "));
    // @ts-ignore
    const trakiVersion = "1.2.0";
    log_trkiout.debug(`TRAKI Version "${trakiVersion}"\n\n`);
    // log params at first bootstrap
    log_trkiout.groupCollapsed("Param Source Values");
    log_trkiout.log(`*apiKey:      "${config.apiKey}"`);
    log_trkiout.log(`*campaignId:  "${config.campaignId}"`);
    log_trkiout.log(`*baseUrl:     "${config.baseUrl}"`);
    log_trkiout.log(`checkoutUrl:  "${config.checkoutUrl}"`);
    log_trkiout.log(`ttyLevel:     "${config.ttyLevel}"`);
    log_trkiout.log(`utmSource:    "${config.utmSource}"`);
    log_trkiout.log(`traceId:      "${config.traceId}"`);
    log_trkiout.groupEnd();
    // verify obligatory initial params
    let missingParams = [];
    if (!config.apiKey) {
        missingParams.push("api_key");
    }
    if (!config.campaignId) {
        missingParams.push("campaign_id");
    }
    if (!config.baseUrl) {
        missingParams.push("base_url");
    }
    if (missingParams.length > 0) {
        log_trkiout.error(`Missing Params: ${missingParams.join(",")}. Cannot start event tracking`);
        return;
    }
    // create trace_id if none yet
    if (!config.traceId) {
        log_trkiout.log('TraceID not found, generating one');
        const isTraceCreated = await createTrace();
        if (!isTraceCreated) {
            log_trkiout.error('Failed to create traceId, cannot start event tracking');
            return;
        }
        else {
            log_trkiout.log('TraceID created successfully');
        }
    }
    inputSourceSelect.updateUtmSource();
    log_trkiout.groupCollapsed("Update storage if any value is new");
    log_trkiout.log(`[2] traceId:      "${config.traceId}"`);
    log_trkiout.log(`[2] utmSource:    "${config.utmSource}"`);
    updateStorageIfChanged(STORAGE_KEYS.API_KEY, config.apiKey);
    updateStorageIfChanged(STORAGE_KEYS.CAMPAIGN_ID, config.campaignId);
    updateStorageIfChanged(STORAGE_KEYS.BASE_URL, config.baseUrl);
    updateStorageIfChanged(STORAGE_KEYS.TRACE_ID, config.traceId);
    updateStorageIfChanged(STORAGE_KEYS.CHECKOUT_URL, config.checkoutUrl);
    log_trkiout.groupEnd();
    let checkoutUrlRegExes = [];
    let checkoutUrlStrings = [];
    if (config.checkoutUrl) {
        checkoutUrlRegExes = compileUrlPatterns(config.checkoutUrl);
        checkoutUrlStrings = compileUrlStrings(config.checkoutUrl);
        log_trkiout.debug("Configured matcher for checkout URL");
    }
    function isNavigatingToCheckout(url) {
        if (config.checkoutUrl) {
            let matched = matchUrlPatterns(checkoutUrlRegExes, url);
            if (!matched) {
                if (checkoutUrlStrings.some(str => config.checkoutUrl.includes(str) || config.checkoutUrl === str)) {
                    log_trkiout.debug(`URL ${url} matched as CHECKOUT url`);
                    matched = true;
                }
            }
        }
        log_trkiout.debug(`URL ${url} isn't for checkout`);
        return false;
    }
    const urlEventsParam = {
        getFinalURL: getFinalURL,
        dispatchEvent: async function eventDispatcher(specificEventName, urlBeforeUtm, metadataParams) {
            log_trkiout.groupCollapsed(`Dispatch Event '${specificEventName}'`);
            let url = urlBeforeUtm ? (urlBeforeUtm instanceof URL ? urlBeforeUtm.toString() : String(urlBeforeUtm)) : "";
            if (!url) {
                log_trkiout.trace("Dispatch Event invoked with empty URL");
            }
            const isToCheckout = isNavigatingToCheckout(url);
            const evtName = isToCheckout ? "InitiateCheckout" : "PageView";
            log_trkiout.log(`Dispatching Event "${evtName}" from subroutine "${specificEventName}"`, metadataParams);
            try {
                if (isToCheckout) {
                    await trackCheckoutInitiated(specificEventName, metadataParams);
                }
                else {
                    log_trkiout.log(`Event of "${evtName}" sent successfully`);
                    await trackPageView(specificEventName, metadataParams);
                }
            }
            catch (error) {
                log_trkiout.error(`Failed to send ${evtName} event:`, error);
            }
            log_trkiout.groupEnd();
        }
    };
    log_trkiout.groupCollapsed("Patch, Listen and Set own UTM source");
    patchIntercept(urlEventsParam);
    listenOutbounds(urlEventsParam);
    setUtmSourceInOwnUrl(config.utmSource);
    log_trkiout.groupEnd();
}
function updateStorageIfChanged(key, newValue) {
    const storedValue = stores.session.get(key);
    if (storedValue != newValue) {
        stores.session.set(key, newValue);
        log_trkiout.log(`Updated ${key} in session storage, stored value "${storedValue}" is outdated since new value "${newValue}" is found.`);
    }
    else {
        log_trkiout.debug(`Did not update ${key} in session storage because the stored value "${storedValue}" is the same as the new value "${newValue}"`);
    }
}
// /**
//  * Main Traki tracking initialization
//  */
// export async function traki() {
//   await sleep(400);
//   let config: ParamSourceObject = ParamSource.asObject();
//   let utmSrc = parseUtmSource();
//   for (let retry = 0; retry < 3; retry ++) {
//     if (config.apiKey && config.campaignId && utmSrc) {
//       break;
//     }
//     await sleep(300);
//     ParamSource.update();
//     config = ParamSource.asObject();
//     if (!utmSrc) {
//       utmSrc = parseUtmSource();
//     }
//   }
//   let missingParams = [];
//   if (utmSrc) {
//     trkiout.log([
//       `Found UTM_SOURCE in URL and it matches TRAKI's hashed data. Will override:`,
//       `- API_KEY was "${config.apiKey}" now is "${utmSrc.apiKey}"`,
//       `- TRACE_ID was "${config.traceId}" now is "${utmSrc.traceId}"`
//     ].join("\n"))
//     stores.session.set(STORAGE_KEYS.API_KEY, utmSrc.apiKey);
//     config.apiKey = utmSrc.apiKey;
//     stores.session.set(STORAGE_KEYS.TRACE_ID, utmSrc.traceId);
//     config.traceId = utmSrc.traceId;
//   } else {
//     trkiout.log("Did not found a valid UTM_SOURCE in url.");
//   }
//   if (!config.campaignId) { missingParams.push("campaign_id"); }
//   if (!config.apiKey) { missingParams.push("api_key"); }
//   if (!config.baseUrl) { missingParams.push("base_url"); }
//   if (!config.checkoutUrl) { missingParams.push("checkoutUrl"); }
//   if (missingParams.length > 0) {
//     trkiout.error(`Missing Params: ${missingParams.join(",")}. Cannot start event tracking`);
//     return;
//   } else {
//     trkiout.log("Required params ok");
//   }
//   const storedApiKey = stores.session.get(STORAGE_KEYS.API_KEY);
//   if (storedApiKey != config.apiKey) {
//     stores.session.set(STORAGE_KEYS.API_KEY, config.apiKey);
//     trkiout.log(`Updated ${STORAGE_KEYS.API_KEY} in session storage from "${storedApiKey}" to "${config.apiKey}"`);
//   }
//   const hasExistingTraceId = Boolean(config.traceId);
//   if (!hasExistingTraceId) {
//     trkiout.log('TraceID not found, generating one');
//     const isTraceCreated = await createTrace();
//     if (!isTraceCreated) {
//       trkiout.error('Failed to create traceId, cannot start event tracking');
//       return;
//     }
//   } else {
//     trkiout.log("TraceID: reused existing traceid '"+config.traceId+"'.")
//   }
//   // Initialize utm_source after trace_id is available
//   initUtmSource();
//   trkiout.log("Initialized successfully - PageView tracking enabled");
//   // Track initial page view
//   trackPageView();
//   // Track page view on every load/navigation
//   onLoad(() => {
//     trackPageView();
//   });
//   // Track page view on SPA navigation (React Router, etc)
//   onRedirect((state) => {
//     trkiout.log(`Navigation detected: ${state.from} -> ${state.to}`);
//     trackPageView();
//   });
//   // TODO: onFormSubmit
// }
// // -------------------------------------
traki();

/******/ })()
;