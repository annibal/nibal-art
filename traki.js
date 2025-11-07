/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// UNUSED EXPORTS: sendEvent, traki

;// ./src/constants/constants.ts
// Storage keys
const STORAGE_KEYS = {
    API_KEY: "TRAKI_API_KEY",
    TRACE_ID: "TRAKI_TRACE_ID",
    CAMPAIGN_ID: "TRAKI_CAMPAIGN_ID",
    BASE_URL: "TRAKI_BASE_URL",
    SESSION_START: "TRAKI_SESSION_START",
};
const DEFAULT_BASE_URL = "https://api.traki.io/";
/**
 * UUID v4 validation regex
 * Matches format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
const constants_UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTM_SOURCE_ID_PARAM = 'utm_source';

;// ./src/functions/storage.ts
function context(name) {
    const context = this;
    return {
        get() {
            return context.get(name);
        },
        set(value) {
            return context.set(name, value);
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
    };
}
function asConst() {
    return (source) => source;
}
const stores = asConst()({
    local: createStore(localStorage),
    session: createStore(sessionStorage),
});

;// ./src/functions/inputSourceSelect.ts



const INPUT_SOURCES = {
    URL_PARAMS: {
        getParamValue: (() => {
            // TODO: deduplicate "getUrlParameters" function and use siungle utility source
            const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
            return function getParamValue(paramName) {
                const r = urlParams[paramName];
                return r ? String(r) : null;
            };
        })()
    },
    SESSION_STORAGE: {
        getParamValue: (() => {
            return function getParamValue(paramName) {
                const r = stores.session.get(paramName);
                return r ? String(r) : null;
            };
        })()
    },
    LOCAL_STORAGE: {
        getParamValue: (() => {
            return function getParamValue(paramName) {
                const r = stores.local.get(paramName);
                return r ? String(r) : null;
            };
        })()
    },
    THIS_SCRIPT: {
        getParamValue: (() => {
            let dad;
            const getDad = () => {
                try {
                    dad = getCurrentScript();
                }
                catch (err1) {
                    try {
                        dad = document.querySelector('script[src*="traki"]');
                        dad?.getAttribute("src");
                    }
                    catch (err2) {
                        try {
                            dad = Array.from(document.scripts).filter(x => x.src.includes("traki"))[0];
                            dad?.getAttribute("src");
                        }
                        catch (err3) {
                            try {
                                console.debug({ err1, err2, err3 });
                            }
                            catch (err4) { }
                        }
                    }
                }
            };
            getDad();
            return function getParamValue(paramName) {
                if (!dad) {
                    getDad();
                }
                if (!dad) {
                    return undefined;
                }
                let r = dad.dataset[paramName] || null;
                if (!r) {
                    r = dad.getAttribute(paramName);
                }
                return r ? String(r) : null;
            };
        })(),
    },
};
const POSSIBLE_NAMES = {
    API_KEY: {
        storageKey: STORAGE_KEYS.API_KEY,
        required: true,
        availableSourcesSorted: [
            "THIS_SCRIPT",
        ],
        possibleWrongNames: [
            ...(`api_key,Api_key,api_Key,Api_Key,Api_KEY,API_Key,API_KEY,api_KEY,API_key,api-key,Api-key,api-Key,Api-Key,Api-KEY,API-Key,API-KEY,api-KEY,API-key,apikey,Apikey,apiKey,ApiKey,APIKey,ApiKEY,APIKEY,apiKEY,APIkey,data-api_key,data-api-key,data-apikey,data-Api_key,data-Api-key,data-Apikey,data-API_KEY,data-API-KEY,data-APIKEY,Data-api_key,Data-api-key,Data-apikey,Data-Api_key,Data-Api-key,Data-Apikey,Data-API_KEY,Data-API-KEY,Data-APIKEY,DATA-api_key,DATA-api-key,DATA-apikey,DATA-Api_key,DATA-Api-key,DATA-Apikey,DATA-API_KEY,DATA-API-KEY,DATA-APIKEY`)
                .split(","),
            ...(`traki_api_key,traki-api_key,trakiapi_key,Traki_api_key,Traki-api_key,Trakiapi_key,traki_api_Key,traki-api_Key,trakiapi_Key,Traki_api_Key,Traki-api_Key,Trakiapi_Key,Traki_api_KEY,Traki-api_KEY,Trakiapi_KEY,TRAKI_API_Key,TRAKI-API_Key,TRAKIAPI_Key,TRAKI_API_KEY,TRAKI-API_KEY,TRAKIAPI_KEY,traki_api_KEY,traki-api_KEY,trakiapi_KEY,TRAKI_API_key,TRAKI-API_key,TRAKIAPI_key,traki_api-key,traki-api-key,trakiapi-key,Traki_api-key,Traki-api-key,Trakiapi-key,traki_api-Key,traki-api-Key,trakiapi-Key,Traki_api-Key,Traki-api-Key,Trakiapi-Key,Traki_api-KEY,Traki-api-KEY,Trakiapi-KEY,TRAKI_API-Key,TRAKI-API-Key,TRAKIAPI-Key,TRAKI_API-KEY,TRAKI-API-KEY,TRAKIAPI-KEY,traki_api-KEY,traki-api-KEY,trakiapi-KEY,TRAKI_API-key,TRAKI-API-key,TRAKIAPI-key,traki_apikey,traki-apikey,trakiapikey,Traki_apikey,Traki-apikey,Trakiapikey,traki_apiKey,traki-apiKey,trakiapiKey,Traki_apiKey,Traki-apiKey,TrakiapiKey,TRAKI_APIKey,TRAKI-APIKey,TRAKIAPIKey,Traki_apiKEY,Traki-apiKEY,TrakiapiKEY,TRAKI_APIKEY,TRAKI-APIKEY,TRAKIAPIKEY,traki_apiKEY,traki-apiKEY,trakiapiKEY,TRAKI_APIkey,TRAKI-APIkey,TRAKIAPIkey,data-traki_api_key,data-traki-api_key,data-trakiapi_key,data-traki_api-key,data-traki-api-key,data-trakiapi-key,data-traki_apikey,data-traki-apikey,data-trakiapikey,data-Traki_api_key,data-Traki-api_key,data-Trakiapi_key,data-Traki_api-key,data-Traki-api-key,data-Trakiapi-key,data-Traki_apikey,data-Traki-apikey,data-Trakiapikey,data-TRAKI_API_KEY,data-TRAKI-API_KEY,data-TRAKIAPI_KEY,data-TRAKI_API-KEY,data-TRAKI-API-KEY,data-TRAKIAPI-KEY,data-TRAKI_APIKEY,data-TRAKI-APIKEY,data-TRAKIAPIKEY,Data-traki_api_key,Data-traki-api_key,Data-trakiapi_key,Data-traki_api-key,Data-traki-api-key,Data-trakiapi-key,Data-traki_apikey,Data-traki-apikey,Data-trakiapikey,Data-Traki_api_key,Data-Traki-api_key,Data-Trakiapi_key,Data-Traki_api-key,Data-Traki-api-key,Data-Trakiapi-key,Data-Traki_apikey,Data-Traki-apikey,Data-Trakiapikey,Data-TRAKI_API_KEY,Data-TRAKI-API_KEY,Data-TRAKIAPI_KEY,Data-TRAKI_API-KEY,Data-TRAKI-API-KEY,Data-TRAKIAPI-KEY,Data-TRAKI_APIKEY,Data-TRAKI-APIKEY,Data-TRAKIAPIKEY,DATA-traki_api_key,DATA-traki-api_key,DATA-trakiapi_key,DATA-traki_api-key,DATA-traki-api-key,DATA-trakiapi-key,DATA-traki_apikey,DATA-traki-apikey,DATA-trakiapikey,DATA-Traki_api_key,DATA-Traki-api_key,DATA-Trakiapi_key,DATA-Traki_api-key,DATA-Traki-api-key,DATA-Trakiapi-key,DATA-Traki_apikey,DATA-Traki-apikey,DATA-Trakiapikey,DATA-TRAKI_API_KEY,DATA-TRAKI-API_KEY,DATA-TRAKIAPI_KEY,DATA-TRAKI_API-KEY,DATA-TRAKI-API-KEY,DATA-TRAKIAPI-KEY,DATA-TRAKI_APIKEY,DATA-TRAKI-APIKEY,DATA-TRAKIAPIKEY`)
                .split(","),
        ],
    },
    CAMPAIGN_ID: {
        storageKey: STORAGE_KEYS.CAMPAIGN_ID,
        required: true,
        availableSourcesSorted: [
            "SESSION_STORAGE",
            "LOCAL_STORAGE",
            "THIS_SCRIPT",
        ],
        possibleWrongNames: [
            ...(`campaign_id,Campaign_id,campaign_Id,Campaign_Id,Campaign_ID,CAMPAIGN_Id,CAMPAIGN_ID,campaign_ID,CAMPAIGN_id,campaign-id,Campaign-id,campaign-Id,Campaign-Id,Campaign-ID,CAMPAIGN-Id,CAMPAIGN-ID,campaign-ID,CAMPAIGN-id,campaignid,Campaignid,campaignId,CampaignId,CAMPAIGNId,CampaignID,CAMPAIGNID,campaignID,CAMPAIGNid,data-campaign_id,data-campaign-id,data-campaignid,data-Campaign_id,data-Campaign-id,data-Campaignid,data-CAMPAIGN_ID,data-CAMPAIGN-ID,data-CAMPAIGNID,Data-campaign_id,Data-campaign-id,Data-campaignid,Data-Campaign_id,Data-Campaign-id,Data-Campaignid,Data-CAMPAIGN_ID,Data-CAMPAIGN-ID,Data-CAMPAIGNID,DATA-campaign_id,DATA-campaign-id,DATA-campaignid,DATA-Campaign_id,DATA-Campaign-id,DATA-Campaignid,DATA-CAMPAIGN_ID,DATA-CAMPAIGN-ID,DATA-CAMPAIGNID`)
                .split(","),
            ...(`traki_campaign_id,traki-campaign_id,trakicampaign_id,Traki_campaign_id,Traki-campaign_id,Trakicampaign_id,traki_campaign_Id,traki-campaign_Id,trakicampaign_Id,Traki_campaign_Id,Traki-campaign_Id,Trakicampaign_Id,Traki_campaign_ID,Traki-campaign_ID,Trakicampaign_ID,TRAKI_CAMPAIGN_Id,TRAKI-CAMPAIGN_Id,TRAKICAMPAIGN_Id,TRAKI_CAMPAIGN_ID,TRAKI-CAMPAIGN_ID,TRAKICAMPAIGN_ID,traki_campaign_ID,traki-campaign_ID,trakicampaign_ID,TRAKI_CAMPAIGN_id,TRAKI-CAMPAIGN_id,TRAKICAMPAIGN_id,traki_campaign-id,traki-campaign-id,trakicampaign-id,Traki_campaign-id,Traki-campaign-id,Trakicampaign-id,traki_campaign-Id,traki-campaign-Id,trakicampaign-Id,Traki_campaign-Id,Traki-campaign-Id,Trakicampaign-Id,Traki_campaign-ID,Traki-campaign-ID,Trakicampaign-ID,TRAKI_CAMPAIGN-Id,TRAKI-CAMPAIGN-Id,TRAKICAMPAIGN-Id,TRAKI_CAMPAIGN-ID,TRAKI-CAMPAIGN-ID,TRAKICAMPAIGN-ID,traki_campaign-ID,traki-campaign-ID,trakicampaign-ID,TRAKI_CAMPAIGN-id,TRAKI-CAMPAIGN-id,TRAKICAMPAIGN-id,traki_campaignid,traki-campaignid,trakicampaignid,Traki_campaignid,Traki-campaignid,Trakicampaignid,traki_campaignId,traki-campaignId,trakicampaignId,Traki_campaignId,Traki-campaignId,TrakicampaignId,TRAKI_CAMPAIGNId,TRAKI-CAMPAIGNId,TRAKICAMPAIGNId,Traki_campaignID,Traki-campaignID,TrakicampaignID,TRAKI_CAMPAIGNID,TRAKI-CAMPAIGNID,TRAKICAMPAIGNID,traki_campaignID,traki-campaignID,trakicampaignID,TRAKI_CAMPAIGNid,TRAKI-CAMPAIGNid,TRAKICAMPAIGNid,data-traki_campaign_id,data-traki-campaign_id,data-trakicampaign_id,data-traki_campaign-id,data-traki-campaign-id,data-trakicampaign-id,data-traki_campaignid,data-traki-campaignid,data-trakicampaignid,data-Traki_campaign_id,data-Traki-campaign_id,data-Trakicampaign_id,data-Traki_campaign-id,data-Traki-campaign-id,data-Trakicampaign-id,data-Traki_campaignid,data-Traki-campaignid,data-Trakicampaignid,data-TRAKI_CAMPAIGN_ID,data-TRAKI-CAMPAIGN_ID,data-TRAKICAMPAIGN_ID,data-TRAKI_CAMPAIGN-ID,data-TRAKI-CAMPAIGN-ID,data-TRAKICAMPAIGN-ID,data-TRAKI_CAMPAIGNID,data-TRAKI-CAMPAIGNID,data-TRAKICAMPAIGNID,Data-traki_campaign_id,Data-traki-campaign_id,Data-trakicampaign_id,Data-traki_campaign-id,Data-traki-campaign-id,Data-trakicampaign-id,Data-traki_campaignid,Data-traki-campaignid,Data-trakicampaignid,Data-Traki_campaign_id,Data-Traki-campaign_id,Data-Trakicampaign_id,Data-Traki_campaign-id,Data-Traki-campaign-id,Data-Trakicampaign-id,Data-Traki_campaignid,Data-Traki-campaignid,Data-Trakicampaignid,Data-TRAKI_CAMPAIGN_ID,Data-TRAKI-CAMPAIGN_ID,Data-TRAKICAMPAIGN_ID,Data-TRAKI_CAMPAIGN-ID,Data-TRAKI-CAMPAIGN-ID,Data-TRAKICAMPAIGN-ID,Data-TRAKI_CAMPAIGNID,Data-TRAKI-CAMPAIGNID,Data-TRAKICAMPAIGNID,DATA-traki_campaign_id,DATA-traki-campaign_id,DATA-trakicampaign_id,DATA-traki_campaign-id,DATA-traki-campaign-id,DATA-trakicampaign-id,DATA-traki_campaignid,DATA-traki-campaignid,DATA-trakicampaignid,DATA-Traki_campaign_id,DATA-Traki-campaign_id,DATA-Trakicampaign_id,DATA-Traki_campaign-id,DATA-Traki-campaign-id,DATA-Trakicampaign-id,DATA-Traki_campaignid,DATA-Traki-campaignid,DATA-Trakicampaignid,DATA-TRAKI_CAMPAIGN_ID,DATA-TRAKI-CAMPAIGN_ID,DATA-TRAKICAMPAIGN_ID,DATA-TRAKI_CAMPAIGN-ID,DATA-TRAKI-CAMPAIGN-ID,DATA-TRAKICAMPAIGN-ID,DATA-TRAKI_CAMPAIGNID,DATA-TRAKI-CAMPAIGNID,DATA-TRAKICAMPAIGNID`)
                .split(","),
        ],
    },
    BASE_URL: {
        storageKey: STORAGE_KEYS.BASE_URL,
        defaultValue: DEFAULT_BASE_URL,
        availableSourcesSorted: [
            "SESSION_STORAGE",
            "LOCAL_STORAGE",
            "THIS_SCRIPT",
        ],
        possibleWrongNames: [
            ...(`base_url,Base_url,base_Url,Base_Url,Base_URL,BASE_Url,BASE_URL,base_URL,BASE_url,base-url,Base-url,base-Url,Base-Url,Base-URL,BASE-Url,BASE-URL,base-URL,BASE-url,baseurl,Baseurl,baseUrl,BaseUrl,BASEUrl,BaseURL,BASEURL,baseURL,BASEurl,data-base_url,data-base-url,data-baseurl,data-Base_url,data-Base-url,data-Baseurl,data-BASE_URL,data-BASE-URL,data-BASEURL,Data-base_url,Data-base-url,Data-baseurl,Data-Base_url,Data-Base-url,Data-Baseurl,Data-BASE_URL,Data-BASE-URL,Data-BASEURL,DATA-base_url,DATA-base-url,DATA-baseurl,DATA-Base_url,DATA-Base-url,DATA-Baseurl,DATA-BASE_URL,DATA-BASE-URL,DATA-BASEURL`)
                .split(","),
            ...(`traki_base_url,traki-base_url,trakibase_url,Traki_base_url,Traki-base_url,Trakibase_url,traki_base_Url,traki-base_Url,trakibase_Url,Traki_base_Url,Traki-base_Url,Trakibase_Url,Traki_base_URL,Traki-base_URL,Trakibase_URL,TRAKI_BASE_Url,TRAKI-BASE_Url,TRAKIBASE_Url,TRAKI_BASE_URL,TRAKI-BASE_URL,TRAKIBASE_URL,traki_base_URL,traki-base_URL,trakibase_URL,TRAKI_BASE_url,TRAKI-BASE_url,TRAKIBASE_url,traki_base-url,traki-base-url,trakibase-url,Traki_base-url,Traki-base-url,Trakibase-url,traki_base-Url,traki-base-Url,trakibase-Url,Traki_base-Url,Traki-base-Url,Trakibase-Url,Traki_base-URL,Traki-base-URL,Trakibase-URL,TRAKI_BASE-Url,TRAKI-BASE-Url,TRAKIBASE-Url,TRAKI_BASE-URL,TRAKI-BASE-URL,TRAKIBASE-URL,traki_base-URL,traki-base-URL,trakibase-URL,TRAKI_BASE-url,TRAKI-BASE-url,TRAKIBASE-url,traki_baseurl,traki-baseurl,trakibaseurl,Traki_baseurl,Traki-baseurl,Trakibaseurl,traki_baseUrl,traki-baseUrl,trakibaseUrl,Traki_baseUrl,Traki-baseUrl,TrakibaseUrl,TRAKI_BASEUrl,TRAKI-BASEUrl,TRAKIBASEUrl,Traki_baseURL,Traki-baseURL,TrakibaseURL,TRAKI_BASEURL,TRAKI-BASEURL,TRAKIBASEURL,traki_baseURL,traki-baseURL,trakibaseURL,TRAKI_BASEurl,TRAKI-BASEurl,TRAKIBASEurl,data-traki_base_url,data-traki-base_url,data-trakibase_url,data-traki_base-url,data-traki-base-url,data-trakibase-url,data-traki_baseurl,data-traki-baseurl,data-trakibaseurl,data-Traki_base_url,data-Traki-base_url,data-Trakibase_url,data-Traki_base-url,data-Traki-base-url,data-Trakibase-url,data-Traki_baseurl,data-Traki-baseurl,data-Trakibaseurl,data-TRAKI_BASE_URL,data-TRAKI-BASE_URL,data-TRAKIBASE_URL,data-TRAKI_BASE-URL,data-TRAKI-BASE-URL,data-TRAKIBASE-URL,data-TRAKI_BASEURL,data-TRAKI-BASEURL,data-TRAKIBASEURL,Data-traki_base_url,Data-traki-base_url,Data-trakibase_url,Data-traki_base-url,Data-traki-base-url,Data-trakibase-url,Data-traki_baseurl,Data-traki-baseurl,Data-trakibaseurl,Data-Traki_base_url,Data-Traki-base_url,Data-Trakibase_url,Data-Traki_base-url,Data-Traki-base-url,Data-Trakibase-url,Data-Traki_baseurl,Data-Traki-baseurl,Data-Trakibaseurl,Data-TRAKI_BASE_URL,Data-TRAKI-BASE_URL,Data-TRAKIBASE_URL,Data-TRAKI_BASE-URL,Data-TRAKI-BASE-URL,Data-TRAKIBASE-URL,Data-TRAKI_BASEURL,Data-TRAKI-BASEURL,Data-TRAKIBASEURL,DATA-traki_base_url,DATA-traki-base_url,DATA-trakibase_url,DATA-traki_base-url,DATA-traki-base-url,DATA-trakibase-url,DATA-traki_baseurl,DATA-traki-baseurl,DATA-trakibaseurl,DATA-Traki_base_url,DATA-Traki-base_url,DATA-Trakibase_url,DATA-Traki_base-url,DATA-Traki-base-url,DATA-Trakibase-url,DATA-Traki_baseurl,DATA-Traki-baseurl,DATA-Trakibaseurl,DATA-TRAKI_BASE_URL,DATA-TRAKI-BASE_URL,DATA-TRAKIBASE_URL,DATA-TRAKI_BASE-URL,DATA-TRAKI-BASE-URL,DATA-TRAKIBASE-URL,DATA-TRAKI_BASEURL,DATA-TRAKI-BASEURL,DATA-TRAKIBASEURL`)
                .split(","),
        ],
    },
    TRACE_ID: {
        storageKey: STORAGE_KEYS.TRACE_ID,
        defaultValue: "",
        availableSourcesSorted: [
            "URL_PARAMS",
            "SESSION_STORAGE",
            "LOCAL_STORAGE",
        ],
        possibleWrongNames: [
            ...(`trace_id,Trace_id,trace_Id,Trace_Id,Trace_ID,TRACE_Id,TRACE_ID,trace_ID,TRACE_id,trace-id,Trace-id,trace-Id,Trace-Id,Trace-ID,TRACE-Id,TRACE-ID,trace-ID,TRACE-id,traceid,Traceid,traceId,TraceId,TRACEId,TraceID,TRACEID,traceID,TRACEid,data-trace_id,data-trace-id,data-traceid,data-Trace_id,data-Trace-id,data-Traceid,data-TRACE_ID,data-TRACE-ID,data-TRACEID,Data-trace_id,Data-trace-id,Data-traceid,Data-Trace_id,Data-Trace-id,Data-Traceid,Data-TRACE_ID,Data-TRACE-ID,Data-TRACEID,DATA-trace_id,DATA-trace-id,DATA-traceid,DATA-Trace_id,DATA-Trace-id,DATA-Traceid,DATA-TRACE_ID,DATA-TRACE-ID,DATA-TRACEID`
                .split(",")),
            ...(`traki_trace_id,traki-trace_id,trakitrace_id,Traki_trace_id,Traki-trace_id,Trakitrace_id,traki_trace_Id,traki-trace_Id,trakitrace_Id,Traki_trace_Id,Traki-trace_Id,Trakitrace_Id,Traki_trace_ID,Traki-trace_ID,Trakitrace_ID,TRAKI_TRACE_Id,TRAKI-TRACE_Id,TRAKITRACE_Id,TRAKI_TRACE_ID,TRAKI-TRACE_ID,TRAKITRACE_ID,traki_trace_ID,traki-trace_ID,trakitrace_ID,TRAKI_TRACE_id,TRAKI-TRACE_id,TRAKITRACE_id,traki_trace-id,traki-trace-id,trakitrace-id,Traki_trace-id,Traki-trace-id,Trakitrace-id,traki_trace-Id,traki-trace-Id,trakitrace-Id,Traki_trace-Id,Traki-trace-Id,Trakitrace-Id,Traki_trace-ID,Traki-trace-ID,Trakitrace-ID,TRAKI_TRACE-Id,TRAKI-TRACE-Id,TRAKITRACE-Id,TRAKI_TRACE-ID,TRAKI-TRACE-ID,TRAKITRACE-ID,traki_trace-ID,traki-trace-ID,trakitrace-ID,TRAKI_TRACE-id,TRAKI-TRACE-id,TRAKITRACE-id,traki_traceid,traki-traceid,trakitraceid,Traki_traceid,Traki-traceid,Trakitraceid,traki_traceId,traki-traceId,trakitraceId,Traki_traceId,Traki-traceId,TrakitraceId,TRAKI_TRACEId,TRAKI-TRACEId,TRAKITRACEId,Traki_traceID,Traki-traceID,TrakitraceID,TRAKI_TRACEID,TRAKI-TRACEID,TRAKITRACEID,traki_traceID,traki-traceID,trakitraceID,TRAKI_TRACEid,TRAKI-TRACEid,TRAKITRACEid,data-traki_trace_id,data-traki-trace_id,data-trakitrace_id,data-traki_trace-id,data-traki-trace-id,data-trakitrace-id,data-traki_traceid,data-traki-traceid,data-trakitraceid,data-Traki_trace_id,data-Traki-trace_id,data-Trakitrace_id,data-Traki_trace-id,data-Traki-trace-id,data-Trakitrace-id,data-Traki_traceid,data-Traki-traceid,data-Trakitraceid,data-TRAKI_TRACE_ID,data-TRAKI-TRACE_ID,data-TRAKITRACE_ID,data-TRAKI_TRACE-ID,data-TRAKI-TRACE-ID,data-TRAKITRACE-ID,data-TRAKI_TRACEID,data-TRAKI-TRACEID,data-TRAKITRACEID,Data-traki_trace_id,Data-traki-trace_id,Data-trakitrace_id,Data-traki_trace-id,Data-traki-trace-id,Data-trakitrace-id,Data-traki_traceid,Data-traki-traceid,Data-trakitraceid,Data-Traki_trace_id,Data-Traki-trace_id,Data-Trakitrace_id,Data-Traki_trace-id,Data-Traki-trace-id,Data-Trakitrace-id,Data-Traki_traceid,Data-Traki-traceid,Data-Trakitraceid,Data-TRAKI_TRACE_ID,Data-TRAKI-TRACE_ID,Data-TRAKITRACE_ID,Data-TRAKI_TRACE-ID,Data-TRAKI-TRACE-ID,Data-TRAKITRACE-ID,Data-TRAKI_TRACEID,Data-TRAKI-TRACEID,Data-TRAKITRACEID,DATA-traki_trace_id,DATA-traki-trace_id,DATA-trakitrace_id,DATA-traki_trace-id,DATA-traki-trace-id,DATA-trakitrace-id,DATA-traki_traceid,DATA-traki-traceid,DATA-trakitraceid,DATA-Traki_trace_id,DATA-Traki-trace_id,DATA-Trakitrace_id,DATA-Traki_trace-id,DATA-Traki-trace-id,DATA-Trakitrace-id,DATA-Traki_traceid,DATA-Traki-traceid,DATA-Trakitraceid,DATA-TRAKI_TRACE_ID,DATA-TRAKI-TRACE_ID,DATA-TRAKITRACE_ID,DATA-TRAKI_TRACE-ID,DATA-TRAKI-TRACE-ID,DATA-TRAKITRACE-ID,DATA-TRAKI_TRACEID,DATA-TRAKI-TRACEID,DATA-TRAKITRACEID`
                .split(",")),
        ],
    },
    TTY_LEVEL: {
        defaultValue: "none",
        availableSourcesSorted: [
            "URL_PARAMS",
            "THIS_SCRIPT",
        ],
        possibleWrongNames: [
            ...(`,tty_lvl,Tty_lvl,tty_Lvl,Tty_Lvl,Tty_LVL,TTY_Lvl,TTY_LVL,tty_LVL,TTY_lvl,tty-lvl,Tty-lvl,tty-Lvl,Tty-Lvl,Tty-LVL,TTY-Lvl,TTY-LVL,tty-LVL,TTY-lvl,ttylvl,Ttylvl,ttyLvl,TtyLvl,TTYLvl,TtyLVL,TTYLVL,ttyLVL,TTYlvl,data-tty_lvl,data-tty-lvl,data-ttylvl,data-Tty_lvl,data-Tty-lvl,data-Ttylvl,data-TTY_LVL,data-TTY-LVL,data-TTYLVL,Data-tty_lvl,Data-tty-lvl,Data-ttylvl,Data-Tty_lvl,Data-Tty-lvl,Data-Ttylvl,Data-TTY_LVL,Data-TTY-LVL,Data-TTYLVL,DATA-tty_lvl,DATA-tty-lvl,DATA-ttylvl,DATA-Tty_lvl,DATA-Tty-lvl,DATA-Ttylvl,DATA-TTY_LVL,DATA-TTY-LVL,DATA-TTYLVL,tty_level,Tty_level,tty_Level,Tty_Level,Tty_LEVEL,TTY_Level,TTY_LEVEL,tty_LEVEL,TTY_level,tty-level,Tty-level,tty-Level,Tty-Level,Tty-LEVEL,TTY-Level,TTY-LEVEL,tty-LEVEL,TTY-level,ttylevel,Ttylevel,ttyLevel,TtyLevel,TTYLevel,TtyLEVEL,TTYLEVEL,ttyLEVEL,TTYlevel,data-tty_level,data-tty-level,data-ttylevel,data-Tty_level,data-Tty-level,data-Ttylevel,data-TTY_LEVEL,data-TTY-LEVEL,data-TTYLEVEL,Data-tty_level,Data-tty-level,Data-ttylevel,Data-Tty_level,Data-Tty-level,Data-Ttylevel,Data-TTY_LEVEL,Data-TTY-LEVEL,Data-TTYLEVEL,DATA-tty_level,DATA-tty-level,DATA-ttylevel,DATA-Tty_level,DATA-Tty-level,DATA-Ttylevel,DATA-TTY_LEVEL,DATA-TTY-LEVEL,DATA-TTYLEVEL,traki_tty_lvl,traki-tty_lvl,trakitty_lvl,Traki_tty_lvl,Traki-tty_lvl,Trakitty_lvl,traki_tty_Lvl,traki-tty_Lvl,trakitty_Lvl,Traki_tty_Lvl,Traki-tty_Lvl,Trakitty_Lvl,Traki_tty_LVL,Traki-tty_LVL,Trakitty_LVL,TRAKI_TTY_Lvl,TRAKI-TTY_Lvl,TRAKITTY_Lvl,TRAKI_TTY_LVL,TRAKI-TTY_LVL,TRAKITTY_LVL,traki_tty_LVL,traki-tty_LVL,trakitty_LVL,TRAKI_TTY_lvl,TRAKI-TTY_lvl,TRAKITTY_lvl,traki_tty-lvl,traki-tty-lvl,trakitty-lvl,Traki_tty-lvl,Traki-tty-lvl,Trakitty-lvl,traki_tty-Lvl,traki-tty-Lvl,trakitty-Lvl,Traki_tty-Lvl,Traki-tty-Lvl,Trakitty-Lvl,Traki_tty-LVL,Traki-tty-LVL,Trakitty-LVL,TRAKI_TTY-Lvl,TRAKI-TTY-Lvl,TRAKITTY-Lvl,TRAKI_TTY-LVL,TRAKI-TTY-LVL,TRAKITTY-LVL,traki_tty-LVL,traki-tty-LVL,trakitty-LVL,TRAKI_TTY-lvl,TRAKI-TTY-lvl,TRAKITTY-lvl,traki_ttylvl,traki-ttylvl,trakittylvl,Traki_ttylvl,Traki-ttylvl,Trakittylvl,traki_ttyLvl,traki-ttyLvl,trakittyLvl,Traki_ttyLvl,Traki-ttyLvl,TrakittyLvl,TRAKI_TTYLvl,TRAKI-TTYLvl,TRAKITTYLvl,Traki_ttyLVL,Traki-ttyLVL,TrakittyLVL,TRAKI_TTYLVL,TRAKI-TTYLVL,TRAKITTYLVL,traki_ttyLVL,traki-ttyLVL,trakittyLVL,TRAKI_TTYlvl,TRAKI-TTYlvl,TRAKITTYlvl`)
                .split(","),
            ...(`data-traki_tty_lvl,data-traki-tty_lvl,data-trakitty_lvl,data-traki_tty-lvl,data-traki-tty-lvl,data-trakitty-lvl,data-traki_ttylvl,data-traki-ttylvl,data-trakittylvl,data-Traki_tty_lvl,data-Traki-tty_lvl,data-Trakitty_lvl,data-Traki_tty-lvl,data-Traki-tty-lvl,data-Trakitty-lvl,data-Traki_ttylvl,data-Traki-ttylvl,data-Trakittylvl,data-TRAKI_TTY_LVL,data-TRAKI-TTY_LVL,data-TRAKITTY_LVL,data-TRAKI_TTY-LVL,data-TRAKI-TTY-LVL,data-TRAKITTY-LVL,data-TRAKI_TTYLVL,data-TRAKI-TTYLVL,data-TRAKITTYLVL,Data-traki_tty_lvl,Data-traki-tty_lvl,Data-trakitty_lvl,Data-traki_tty-lvl,Data-traki-tty-lvl,Data-trakitty-lvl,Data-traki_ttylvl,Data-traki-ttylvl,Data-trakittylvl,Data-Traki_tty_lvl,Data-Traki-tty_lvl,Data-Trakitty_lvl,Data-Traki_tty-lvl,Data-Traki-tty-lvl,Data-Trakitty-lvl,Data-Traki_ttylvl,Data-Traki-ttylvl,Data-Trakittylvl,Data-TRAKI_TTY_LVL,Data-TRAKI-TTY_LVL,Data-TRAKITTY_LVL,Data-TRAKI_TTY-LVL,Data-TRAKI-TTY-LVL,Data-TRAKITTY-LVL,Data-TRAKI_TTYLVL,Data-TRAKI-TTYLVL,Data-TRAKITTYLVL,DATA-traki_tty_lvl,DATA-traki-tty_lvl,DATA-trakitty_lvl,DATA-traki_tty-lvl,DATA-traki-tty-lvl,DATA-trakitty-lvl,DATA-traki_ttylvl,DATA-traki-ttylvl,DATA-trakittylvl,DATA-Traki_tty_lvl,DATA-Traki-tty_lvl,DATA-Trakitty_lvl,DATA-Traki_tty-lvl,DATA-Traki-tty-lvl,DATA-Trakitty-lvl,DATA-Traki_ttylvl,DATA-Traki-ttylvl,DATA-Trakittylvl,DATA-TRAKI_TTY_LVL,DATA-TRAKI-TTY_LVL,DATA-TRAKITTY_LVL,DATA-TRAKI_TTY-LVL,DATA-TRAKI-TTY-LVL,DATA-TRAKITTY-LVL,DATA-TRAKI_TTYLVL,DATA-TRAKI-TTYLVL,DATA-TRAKITTYLVL,traki_tty_level,traki-tty_level,trakitty_level,Traki_tty_level,Traki-tty_level,Trakitty_level,traki_tty_Level,traki-tty_Level,trakitty_Level,Traki_tty_Level,Traki-tty_Level,Trakitty_Level,Traki_tty_LEVEL,Traki-tty_LEVEL,Trakitty_LEVEL,TRAKI_TTY_Level,TRAKI-TTY_Level,TRAKITTY_Level,TRAKI_TTY_LEVEL,TRAKI-TTY_LEVEL,TRAKITTY_LEVEL,traki_tty_LEVEL,traki-tty_LEVEL,trakitty_LEVEL,TRAKI_TTY_level,TRAKI-TTY_level,TRAKITTY_level,traki_tty-level,traki-tty-level,trakitty-level,Traki_tty-level,Traki-tty-level,Trakitty-level,traki_tty-Level,traki-tty-Level,trakitty-Level,Traki_tty-Level,Traki-tty-Level,Trakitty-Level,Traki_tty-LEVEL,Traki-tty-LEVEL,Trakitty-LEVEL,TRAKI_TTY-Level,TRAKI-TTY-Level,TRAKITTY-Level,TRAKI_TTY-LEVEL,TRAKI-TTY-LEVEL,TRAKITTY-LEVEL,traki_tty-LEVEL,traki-tty-LEVEL,trakitty-LEVEL,TRAKI_TTY-level,TRAKI-TTY-level,TRAKITTY-level,traki_ttylevel,traki-ttylevel,trakittylevel,Traki_ttylevel,Traki-ttylevel,Trakittylevel,traki_ttyLevel,traki-ttyLevel,trakittyLevel,Traki_ttyLevel,Traki-ttyLevel,TrakittyLevel,TRAKI_TTYLevel,TRAKI-TTYLevel,TRAKITTYLevel,Traki_ttyLEVEL,Traki-ttyLEVEL,TrakittyLEVEL,TRAKI_TTYLEVEL,TRAKI-TTYLEVEL,TRAKITTYLEVEL,traki_ttyLEVEL,traki-ttyLEVEL,trakittyLEVEL,TRAKI_TTYlevel,TRAKI-TTYlevel,TRAKITTYlevel,data-traki_tty_level,data-traki-tty_level,data-trakitty_level,data-traki_tty-level,data-traki-tty-level,data-trakitty-level,data-traki_ttylevel,data-traki-ttylevel,data-trakittylevel,data-Traki_tty_level,data-Traki-tty_level,data-Trakitty_level,data-Traki_tty-level,data-Traki-tty-level,data-Trakitty-level,data-Traki_ttylevel,data-Traki-ttylevel,data-Trakittylevel,data-TRAKI_TTY_LEVEL,data-TRAKI-TTY_LEVEL,data-TRAKITTY_LEVEL,data-TRAKI_TTY-LEVEL,data-TRAKI-TTY-LEVEL,data-TRAKITTY-LEVEL,data-TRAKI_TTYLEVEL,data-TRAKI-TTYLEVEL,data-TRAKITTYLEVEL,Data-traki_tty_level,Data-traki-tty_level,Data-trakitty_level,Data-traki_tty-level,Data-traki-tty-level,Data-trakitty-level,Data-traki_ttylevel,Data-traki-ttylevel,Data-trakittylevel,Data-Traki_tty_level,Data-Traki-tty_level,Data-Trakitty_level,Data-Traki_tty-level,Data-Traki-tty-level,Data-Trakitty-level,Data-Traki_ttylevel,Data-Traki-ttylevel,Data-Trakittylevel,Data-TRAKI_TTY_LEVEL,Data-TRAKI-TTY_LEVEL,Data-TRAKITTY_LEVEL,Data-TRAKI_TTY-LEVEL,Data-TRAKI-TTY-LEVEL,Data-TRAKITTY-LEVEL,Data-TRAKI_TTYLEVEL,Data-TRAKI-TTYLEVEL,Data-TRAKITTYLEVEL,DATA-traki_tty_level,DATA-traki-tty_level,DATA-trakitty_level,DATA-traki_tty-level,DATA-traki-tty-level,DATA-trakitty-level,DATA-traki_ttylevel,DATA-traki-ttylevel,DATA-trakittylevel,DATA-Traki_tty_level,DATA-Traki-tty_level,DATA-Trakitty_level,DATA-Traki_tty-level,DATA-Traki-tty-level,DATA-Trakitty-level,DATA-Traki_ttylevel,DATA-Traki-ttylevel,DATA-Trakittylevel,DATA-TRAKI_TTY_LEVEL,DATA-TRAKI-TTY_LEVEL,DATA-TRAKITTY_LEVEL,DATA-TRAKI_TTY-LEVEL,DATA-TRAKI-TTY-LEVEL,DATA-TRAKITTY-LEVEL,DATA-TRAKI_TTYLEVEL,DATA-TRAKI-TTYLEVEL,DATA-TRAKITTYLEVEL`)
                .split(","),
        ],
    },
};
function selectFirstInputSource(param) {
    const config = POSSIBLE_NAMES[param];
    let value = null;
    for (let sourceKey of config.availableSourcesSorted) {
        const source = INPUT_SOURCES[sourceKey];
        for (let paramName of config.possibleWrongNames) {
            const r = source.getParamValue(paramName);
            console.debug(`Source:${sourceKey} Param:${paramName} Val:${r}`);
            if (r) {
                value = String(r);
                return value;
            }
        }
    }
    return null;
}
function getAllInputSources() {
    return Object.keys(POSSIBLE_NAMES).reduce((all, curr) => ({
        ...all,
        [curr]: selectFirstInputSource(curr),
    }), {});
}
const TTY_LEVELS = {
    error: 1, // err:     1,
    warn: 2, // warning: 2, 
    log: 3,
    info: 4,
    debug: 5, // verbose: 5,
    trace: 6,
};
const scriptElmTiedParams = Object.entries(POSSIBLE_NAMES)
    .map(([key, value]) => ({ ...value, keyName: key }))
    .filter((aggVal) => aggVal.availableSourcesSorted.includes("THIS_SCRIPT"))
    .map((aggVal) => aggVal.keyName);
class _ParamSource {
    API_KEY = "";
    CAMPAIGN_ID = "";
    BASE_URL = POSSIBLE_NAMES.BASE_URL.defaultValue;
    TRACE_ID = POSSIBLE_NAMES.TRACE_ID.defaultValue;
    TTY_LEVEL = POSSIBLE_NAMES.TTY_LEVEL.defaultValue;
    ttylvl = 0;
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
    }
    updateParamsThatMightNotHaveReadFromScriptElm() {
        scriptElmTiedParams.filter(keyName => this[keyName] === undefined).forEach(keyName => this.refresh(keyName));
    }
    updateScriptTiedParamIfNeeded(paramName) {
        const tiedToScriptElm = POSSIBLE_NAMES[paramName].availableSourcesSorted.includes("THIS_SCRIPT");
        if (tiedToScriptElm) {
            this.refresh(paramName);
        }
    }
    refresh(paramName) {
        let paramValue = selectFirstInputSource(paramName);
        //@ts-ignore
        if (!paramValue)
            paramValue = POSSIBLE_NAMES[paramName].defaultValue;
        if (!paramValue)
            paramValue = "";
        this[paramName] = paramValue;
    }
    asObject() {
        this.updateParamsThatMightNotHaveReadFromScriptElm();
        return {
            apiKey: this.getApiKey(),
            campaignId: this.getCampaignId(),
            baseUrl: this.getBaseUrl(),
            traceId: this.getTraceId(),
            ttyLevel: this.getTtyLevel(),
        };
    }
    getApiKey() {
        this.updateScriptTiedParamIfNeeded("API_KEY");
        return this.API_KEY;
    }
    getCampaignId() {
        this.updateScriptTiedParamIfNeeded("CAMPAIGN_ID");
        return this.CAMPAIGN_ID;
    }
    getBaseUrl() {
        this.updateScriptTiedParamIfNeeded("BASE_URL");
        return this.BASE_URL;
    }
    getTraceId() {
        this.updateScriptTiedParamIfNeeded("TRACE_ID");
        return this.TRACE_ID;
    }
    getTtyLevel() {
        this.updateScriptTiedParamIfNeeded("TTY_LEVEL");
        return this.TTY_LEVEL;
    }
    // console levels`
    getCanTTY(loglevel) {
        const logLevelNum = TTY_LEVELS[this.TTY_LEVEL.toLowerCase()] || 0;
        return this.ttylvl <= logLevelNum;
    }
    static _instance;
    static get instance() {
        return this._instance ??= new _ParamSource();
    }
    getSelf() {
        return this;
    }
}
const ParamSource = _ParamSource.instance;
/* harmony default export */ const inputSourceSelect = (ParamSource);

;// ./src/functions/agnostic.ts


function onRedirect(on) {
    polyfill();
    if (window.navigation) {
        setupListener();
    }
    else {
        window.addEventListener('navigationReady', setupListener);
    }
    function setupListener() {
        let lastURL;
        window.navigation?.addEventListener('navigate', (event) => {
            if (!event?.destination?.url)
                return;
            // Handle URL object vs string (same safeTry pattern from original)
            try {
                event.destination.url = event?.destination?.url?.href ?? event?.destination?.url;
            }
            catch { }
            const initState = {
                from: window.location.href,
                to: event.destination.url,
            };
            const state = {
                ...initState,
            };
            on({
                ...state,
                set: (url) => {
                    state.to = url;
                },
            });
            // Only intercept if the URL was actually changed
            const urlWasModified = initState.to !== state.to;
            const shouldIntercept = urlWasModified && lastURL !== state.to;
            if (!shouldIntercept)
                return;
            event.preventDefault();
            lastURL = state.to;
            redirect(event, state.to);
        });
    }
}
function polyfill() {
    if (!window.navigation) {
        const polyfillScript = document.createElement('script');
        polyfillScript.type = 'module';
        polyfillScript.textContent = `
      import * as navigationPolyfill from 'https://cdn.skypack.dev/navigation-api-polyfill';
      window.dispatchEvent(new Event('navigationReady'));
    `;
        document.head.appendChild(polyfillScript);
    }
    else {
        window.dispatchEvent(new Event('navigationReady'));
    }
}
function redirect(event, url) {
    const navigation = window.navigation;
    const shouldRefresh = !event.destination.sameDocument;
    if (shouldRefresh) {
        return navigation.navigate(url, {
            history: event.navigationType === 'push' ? 'push'
                : event.navigationType === 'replace' ? 'replace'
                    : 'auto'
        });
    }
    history.pushState({}, '', url);
}
const getCurrentScript = (() => {
    let currentScript = document.currentScript;
    if (!currentScript || !(currentScript instanceof HTMLScriptElement)) {
        currentScript = document.querySelector(`script[src*="${DEFAULT_BASE_URL}"]`);
    }
    if (!currentScript || !(currentScript instanceof HTMLScriptElement)) {
        currentScript = document.querySelector(`script[src*="traki.io"]`);
    }
    return function _getCurrentScript() {
        return currentScript;
    };
})();
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
function getTheURL(path, baseURL = "", version = "v1") {
    let base = inputSourceSelect.getBaseUrl();
    if (baseURL) {
        base = baseURL;
    }
    return ([base, version, path].join("/") + "/").replace(/(?<!https?:\/?)\/+/gi, "/");
}

;// ./src/functions/log.ts

// TODO: unused
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
/**
 * Console[.log][.error][.info][.debug][etc] replacement, controlled by source param flags that enable it.
 */
const trkiout = (() => {
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
                return safeVoid;
            }
            ;
        }
    }
    catch (e1) {
        try {
            if (inputSourceSelect.getCanTTY("error")) {
                console.error("[Traki] Failed to verify console compatibility: ", e1);
            }
        }
        catch (e2) {
            // can't console.error at all
        }
        return safeVoid;
    }
    // console wrapper
    return new Proxy({}, {
        get(_, prop) {
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
            // yes i can log that.
            return (...args) => {
                // let me prefix some stuff:
                if (typeof args[0] === "string") {
                    args[0] = `[TRAKI] ${args[0]}`;
                }
                //and log it.
                logType(...args);
            };
        }
    });
})();

;// ./src/functions/onLoad.ts
/**
 * Executes a function when the document is loaded
 * @param fn Function to execute
 */
function onLoad(fn) {
    if (isDocumentLoaded()) {
        return fn();
    }
    window.addEventListener("load", fn);
    window.addEventListener("DOMContentLoaded", fn);
}
/**
 * Checks if the document is already loaded
 */
function isDocumentLoaded() {
    return document.readyState === 'complete';
}

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
    return typeof value === 'string' && constants_UUID_V4_REGEX.test(value);
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
function validateRequired(value, field) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new ValidationError(`${field} is required`, field, value);
    }
}
/**
 * Validates UUID fields
 */
function validateUUID(value, field) {
    if (!isValidUUID(value)) {
        throw new ValidationError(`${field} must be a valid UUID v4`, field, value);
    }
}
/**
 * Validates optional UUID fields (allows undefined/null)
 */
function validateOptionalUUID(value, field) {
    if (value !== undefined && value !== null && !isValidUUID(value)) {
        throw new ValidationError(`${field} must be a valid UUID v4 or undefined`, field, value);
    }
}
/**
 * Validates ISO date fields
 */
function validateISODate(value, field) {
    if (!isValidISODate(value)) {
        throw new ValidationError(`${field} must be a valid ISO 8601 date`, field, value);
    }
}
/**
 * Validates optional ISO date fields
 */
function validateOptionalISODate(value, field) {
    if (value !== undefined && value !== null && !isValidISODate(value)) {
        throw new ValidationError(`${field} must be a valid ISO 8601 date or undefined`, field, value);
    }
}
function safeTry(fn, $default) {
    try {
        return fn();
    }
    catch {
        return $default;
    }
}

;// ./src/export/traki.ts







/**
 * Silent UUID validation (doesn't throw)
 */
function validateUUIDSilent(value) {
    return UUID_V4_REGEX.test(value);
}
/**
 * Create a new trace via API
 */
async function createTrace(config) {
    if (!config.campaignId || !config.apiKey) {
        trkiout.error('Cannot create trace: missing campaign_id or api_key');
        return false;
    }
    const tracePayload = {
        campaign_id: config.campaignId,
        final_url: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_term: new URLSearchParams(window.location.search).get('utm_term'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        user_agent: navigator.userAgent,
        accept_language: navigator.language,
    };
    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
    };
    try {
        const response = await fetch(getTheURL("traces"), {
            method: 'POST',
            headers,
            body: JSON.stringify(tracePayload),
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            trkiout.error('Failed to create trace:', errorData);
            return false;
        }
        const result = await response.json();
        const createdTraceId = result.data?.trace?.id;
        if (createdTraceId) {
            // Update config with the new trace_id and store in sessionStorage
            config.traceId = createdTraceId;
            stores.session.set(STORAGE_KEYS.TRACE_ID, createdTraceId);
            trkiout.log('Trace created successfully:', createdTraceId);
            return true;
        }
        return false;
    }
    catch (error) {
        trkiout.error('Failed to create trace:', error);
        return false;
    }
}
/**
 * Main Traki tracking initialization
 */
async function traki() {
    inputSourceSelect.update();
    let config = inputSourceSelect.asObject();
    trkiout.debug('ParamSource 1:', config);
    await sleep(600);
    inputSourceSelect.update();
    config = inputSourceSelect.asObject();
    trkiout.debug('ParamSource 2:', config);
    await sleep(600);
    inputSourceSelect.update();
    config = inputSourceSelect.asObject();
    trkiout.debug('ParamSource 3:', config);
    if (!config.campaignId) {
        trkiout.error("missing CampaignID, skipping event tracking");
        return;
    }
    if (!config.apiKey) {
        trkiout.error("missing ApiKey, skipping event tracking");
        return;
    }
    const hasExistingTraceId = Boolean(config.traceId);
    if (!hasExistingTraceId) {
        trkiout.log('TraceID not found, generating one');
        const isTraceCreated = await createTrace(config);
        if (!isTraceCreated) {
            trkiout.error('Failed to create trace, skipping event tracking');
        }
    }
    inputSourceSelect.update();
    trkiout.log("Initialized successfully", {});
    onLoad(() => {
        trackPageView();
    });
    onRedirect((state) => {
        trackBeforeRedirect(state.from, state.to);
    });
    // TODO: track onPageUnload
}
/**
 * Track page view event
 */
async function trackPageView() {
    const payload = {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
        timestamp: Date.now(),
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    };
    sendEvent({
        name: 'page_view',
        payload,
    });
}
/**
 * Track before redirect event
 */
async function trackBeforeRedirect(from, to) {
    sendEvent({
        name: 'before_redirect',
        payload: { from, to, timestamp: Date.now() },
    });
}
/**
 * Sends an event to the Traki API with retry logic
 *
 * @param traceId - UUID of the trace to associate this event with
 * @param eventData - Event data without trace_id (will be added automatically)
 * @param options - Optional configuration for retry behavior
 * @returns Promise resolving to the API response
 *
 * @throws {ValidationError} If required fields are missing or invalid
 * @throws {Error} If the API request fails after all retries
 *
 * @example
 * ```typescript
 * const response = await sendEvent('550e8400-e29b-41d4-a716-446655440000', {
 *   name: 'page_view',
 *   campaign_id: '660e8400-e29b-41d4-a716-446655440000',
 *   payload: { url: '/home', referrer: '/landing' }
 * });
 *
 * if ('data' in response) {
 *   log('Event created:', response.data.event.id);
 * }
 * ```
 */
async function sendEvent(eventData, options = {}) {
    const { maxRetries = 2, retryDelay = 1000, apiKey = inputSourceSelect.getApiKey(), baseUrl = inputSourceSelect.getBaseUrl(), traceId = inputSourceSelect.getTraceId(), campaignId = inputSourceSelect.getCampaignId(), } = (options || {});
    // Client-side validation
    try {
        validateRequired(traceId, 'trace_id');
        validateUUID(traceId, 'trace_id');
        validateRequired(eventData.name, 'name');
        validateOptionalUUID(campaignId, 'campaign_id');
    }
    catch (error) {
        if (error instanceof ValidationError) {
            trkiout.error(` Validation failed: ${error.message}`, {
                field: error.field,
                value: error.value,
            });
            return {
                success: false,
                error: `Validation failed: ${error.message}`,
                details: error,
            };
        }
        throw error;
    }
    const requestBody = {
        ...eventData,
        trace_id: String(traceId),
        campaign_id: String(campaignId),
    };
    // Build headers
    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };
    // Retry logic
    const response = await (async () => {
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(getTheURL("/events/", baseUrl), {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(requestBody),
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    // Don't retry on client errors (4xx), only server errors (5xx)
                    if (response.status >= 400 && response.status < 500) {
                        return {
                            success: false,
                            error: `API request failed with status ${response.status}`,
                            details: errorData,
                        };
                    }
                    // Retry on server errors
                    lastError = new Error(`Server error: ${response.status}`);
                    if (attempt < maxRetries) {
                        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
                        continue;
                    }
                }
                else {
                    return await response.json();
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                // Don't retry on abort/timeout for the last attempt
                if (attempt < maxRetries && !lastError.message.includes('aborted')) {
                    await sleep(retryDelay * (attempt + 1));
                    continue;
                }
            }
        }
        return {
            success: false,
            error: lastError?.message || 'Request failed after retries',
            details: lastError,
        };
    })();
    if ('data' in response) {
        trkiout.log(`Event "${eventData.name}" tracked successfully`, response.data);
    }
    else {
        trkiout.error(`Event "${eventData.name}" failed`, response.error);
    }
    return response;
}
requestAnimationFrame(traki);

/******/ })()
;