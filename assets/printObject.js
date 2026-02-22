function printObject(obj, options = {}) {
  const {
    maxDepth = 10,
    showFunctions = false,
    showUndefined = false,
    className = 'print-object',
    expandArrays = true,
    showFiltered = false
  } = options;
  
  const visited = new WeakSet();
  
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  function getValueType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'function') return 'function';
    if (typeof value === 'symbol') return 'symbol';
    if (typeof value === 'bigint') return 'bigint';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Error) return 'error';
    if (value instanceof Map) return 'map';
    if (value instanceof Set) return 'set';
    return 'object';
  }
  
  function formatPrimitive(value, type) {
    const span = `<span class="${className}__value ${className}__value--${type}">`;
    
    switch (type) {
      case 'null':
        return `${span}null</span>`;
      case 'undefined':
        return `${span}undefined</span>`;
      case 'string':
        return `${span}"${escapeHtml(value)}"</span>`;
      case 'number':
      case 'boolean':
      case 'bigint':
        return `${span}${escapeHtml(String(value))}</span>`;
      case 'function':
        const funcStr = value.toString();
        const funcName = value.name || 'anonymous';
        const preview = funcStr.length > 50 ? 
          `${funcStr.substring(0, 47)}...` : funcStr;
        return `${span}ƒ ${funcName}() { ${escapeHtml(preview)} }</span>`;
      case 'symbol':
        return `${span}${escapeHtml(String(value))}</span>`;
      case 'date':
        return `${span}${escapeHtml(value.toISOString())}</span>`;
      case 'regexp':
        return `${span}${escapeHtml(String(value))}</span>`;
      case 'error':
        return `${span}Error: ${escapeHtml(value.message)}</span>`;
      default:
        return `${span}${escapeHtml(String(value))}</span>`;
    }
  }
  
  function printValue(value, depth = 0, key = null) {
    // Check depth limit
    if (depth > maxDepth) {
      return `<span class="${className}__value ${className}__value--truncated">[Max depth reached]</span>`;
    }
    
    const type = getValueType(value);
    
    // Handle primitives and special cases
    if (type === 'undefined' && !showUndefined) {
      return null;
    }
    
    if (type === 'function' && !showFunctions) {
      return null;
    }
    
    if (['null', 'undefined', 'string', 'number', 'boolean', 'function', 
         'symbol', 'bigint', 'date', 'regexp', 'error'].includes(type)) {
      return formatPrimitive(value, type);
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (visited.has(value)) {
        return `<span class="${className}__value ${className}__value--circular">[Circular Reference]</span>`;
      }
      visited.add(value);
    }
    
    let result = '';
    
    try {
      if (type === 'array') {
        if (value.length === 0) {
          result = `<span class="${className}__value ${className}__value--array">[]</span>`;
        } else if (expandArrays) {
          const items = value
            .map((item, index) => {
              const itemHtml = printValue(item, depth + 1, index);
              if (itemHtml === null) return null;
              return `<li class="${className}__item">
                <span class="${className}__key ${className}__key--index">${index}:</span> ${itemHtml}
              </li>`;
            })
            .filter(item => item !== null);
          
          if (items.length === 0) {
            result = showFiltered ? 
              `<span class="${className}__value ${className}__value--array">[${value.length} items (filtered)]</span>` :
              `<span class="${className}__value ${className}__value--array">[]</span>`;
          } else {
            result = `<div class="${className}__array">
              <span class="${className}__bracket">[</span>
              <ul class="${className}__list">${items.join('')}</ul>
              <span class="${className}__bracket">]</span>
            </div>`;
          }
        } else {
          result = `<span class="${className}__value ${className}__value--array">[Array(${value.length})]</span>`;
        }
      } else if (type === 'set') {
        if (value.size === 0) {
          result = `<span class="${className}__value ${className}__value--set">Set(0) {}</span>`;
        } else {
          const items = Array.from(value)
            .map((item, index) => {
              const itemHtml = printValue(item, depth + 1, index);
              if (itemHtml === null) return null;
              return `<li class="${className}__item">${itemHtml}</li>`;
            })
            .filter(item => item !== null);
          
          result = `<div class="${className}__set">
            <span class="${className}__type">Set(${value.size})</span>
            <span class="${className}__bracket"> {</span>
            <ul class="${className}__list">${items.join('')}</ul>
            <span class="${className}__bracket">}</span>
          </div>`;
        }
      } else if (type === 'map') {
        if (value.size === 0) {
          result = `<span class="${className}__value ${className}__value--map">Map(0) {}</span>`;
        } else {
          const items = Array.from(value.entries())
            .map(([k, v]) => {
              const keyHtml = printValue(k, depth + 1);
              const valueHtml = printValue(v, depth + 1);
              if (keyHtml === null || valueHtml === null) return null;
              return `<li class="${className}__item">
                ${keyHtml} <span class="${className}__arrow">=></span> ${valueHtml}
              </li>`;
            })
            .filter(item => item !== null);
          
          result = `<div class="${className}__map">
            <span class="${className}__type">Map(${value.size})</span>
            <span class="${className}__bracket"> {</span>
            <ul class="${className}__list">${items.join('')}</ul>
            <span class="${className}__bracket">}</span>
          </div>`;
        }
      } else {
        // Regular object
        const keys = Object.keys(value);
        const symbols = Object.getOwnPropertySymbols(value);
        const allKeys = [...keys, ...symbols];
        
        if (allKeys.length === 0) {
          result = `<span class="${className}__value ${className}__value--object">{}</span>`;
        } else {
          const items = allKeys
            .map(k => {
              const val = value[k];
              const valHtml = printValue(val, depth + 1, k);
              if (valHtml === null) return null;
              
              const keyStr = typeof k === 'symbol' ? String(k) : k;
              const keyClass = typeof k === 'symbol' ? 'symbol' : 'string';
              
              return `<li class="${className}__item">
                <span class="${className}__key ${className}__key--${keyClass}">${escapeHtml(keyStr)}:</span>
                ${valHtml}
              </li>`;
            })
            .filter(item => item !== null);
          
          if (items.length === 0) {
            result = showFiltered ? 
              `<span class="${className}__value ${className}__value--object">{${allKeys.length} properties (filtered)}</span>` :
              `<span class="${className}__value ${className}__value--object">{}</span>`;
          } else {
            result = `<div class="${className}__object">
              <span class="${className}__bracket">{</span>
              <ul class="${className}__list">${items.join('')}</ul>
              <span class="${className}__bracket">}</span>
            </div>`;
          }
        }
      }
    } finally {
      // Clean up circular reference tracking
      if (typeof value === 'object' && value !== null) {
        visited.delete(value);
      }
    }
    
    return result;
  }
  
  const html = printValue(obj, 0);
  return `<div class="${className}">${html || '<span class="print-object__value print-object__value--empty">[Empty]</span>'}</div>`;
}

// Default CSS styles (optional - include in your HTML)
const printObjectCSS = `
.print-object {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.print-object__list {
  list-style: none;
  margin: 0;
  padding-left: 20px;
}

.print-object__item {
  margin: 2px 0;
}

.print-object__key {
  font-weight: bold;
  margin-right: 8px;
}

.print-object__key--string { color: #881391; }
.print-object__key--symbol { color: #c41a16; }
.print-object__key--index { color: #1c00cf; }

.print-object__value--string { color: #c41a16; }
.print-object__value--number { color: #1c00cf; }
.print-object__value--boolean { color: #1c00cf; }
.print-object__value--null { color: #808080; font-style: italic; }
.print-object__value--undefined { color: #808080; font-style: italic; }
.print-object__value--function { color: #ad3e00; }
.print-object__value--symbol { color: #c41a16; }
.print-object__value--date { color: #ad3e00; }
.print-object__value--regexp { color: #ad3e00; }
.print-object__value--circular { color: #808080; font-style: italic; }
.print-object__value--truncated { color: #808080; font-style: italic; }

.print-object__array {
  display: contents;
}
.print-object__array .print-object__bracket ~ .print-object__list {
  padding-top: 0.5em;
}

.print-object__bracket { color: #000; font-weight: bold; }
.print-object__type { color: #881391; font-weight: bold; }
.print-object__arrow { color: #000; margin: 0 4px; }

.print-object > .print-object__object > .print-object__bracket {
    display: none;
}
.print-object > .print-object__object > .print-object__list {
    padding-left: 0;
}
`

/* Dark theme (optional) */
const printObjectCSS_Dark = `
@media (prefers-color-scheme: dark) {
  .print-object {
    color: #e1e1e1;
    background: #1e1e1e;
  }
  
  .print-object__key--string { color: #dcdcaa; }
  .print-object__key--symbol { color: #f44747; }
  .print-object__key--index { color: #569cd6; }
  
  .print-object__value--string { color: #ce9178; }
  .print-object__value--number { color: #b5cea8; }
  .print-object__value--boolean { color: #569cd6; }
  .print-object__value--null,
  .print-object__value--undefined { color: #808080; }
  .print-object__value--function { color: #dcdcaa; }
  .print-object__bracket { color: #d4d4d4; }
  .print-object__type { color: #4ec9b0; }
}
`;

// Usage examples:
/*
// Basic usage
const obj = { name: "John", age: 30, active: true };
document.body.innerHTML = printObject(obj);

// With options
const complexObj = {
  str: "hello",
  num: 42,
  bool: true,
  null: null,
  undef: undefined,
  arr: [1, 2, { nested: true }],
  func: function() { return "test"; },
  date: new Date(),
  regex: /test/gi,
  map: new Map([["key1", "value1"], ["key2", "value2"]]),
  set: new Set([1, 2, 3]),
  symbol: Symbol("test")
};

const html = printObject(complexObj, {
  maxDepth: 5,
  showFunctions: true,
  showUndefined: true,
  showFiltered: false,  // Hide "filtered" messages when items are excluded
  className: 'my-object-printer'
});

document.body.innerHTML = html;
*/