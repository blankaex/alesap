/*
 * +------------------------------------------------------------
 * | i18n.js
 * +------------------------------------------------------------
 * | loads UI strings from strings.json and exposes the i18n()
 * | helper used to retrieve strings in the active language.
 * | Active language is read from localStorage (key: "language")
 * | with "en" as the default. Any element marked with a
 * | data-i18n attribute (or data-i18n-placeholder /
 * | data-i18n-html / data-i18n-value) is substituted by
 * | apply_translations() at startup time.
 * +------------------------------------------------------------
 */

// Global string table populated by load_strings().
let STRINGS = {};

// Returns the currently selected language code ("en" or "ja").
function current_language() {
    return localStorage.getItem("language") === "ja" ? "ja" : "en";
}

// Returns the localized string for the given key. If the key is
// missing it returns the key itself so missing translations are
// visible. `vars` allows {placeholder} substitution in the value.
function i18n(key, vars) {
    const entry = STRINGS[key];
    let value;
    if (!entry || typeof entry !== "object") {
        value = key;
    } else {
        value = entry[current_language()] ?? entry.en ?? key;
    }
    if (vars) {
        Object.keys(vars).forEach(name => {
            value = value.split(`{${name}}`).join(vars[name]);
        });
    }
    return value;
}

// Loads strings.json from the site root and caches into STRINGS.
// Returns a Promise that resolves once the table is ready.
function load_strings() {
    return fetch("strings.json", { cache: "no-cache" })
        .then(r => r.json())
        .then(data => { STRINGS = data; })
        .catch(err => {
            console.error("Failed to load strings.json", err);
            STRINGS = {};
        });
}

// Walks the DOM and replaces text content / placeholders / html /
// value for any element marked with a data-i18n* attribute.
// Also translates weaver-rendered tab nav links using a stable key map.
// Safe to call multiple times (e.g. on language change).
function apply_translations(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => {
        el.textContent = i18n(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-html]").forEach(el => {
        el.innerHTML = i18n(el.getAttribute("data-i18n-html"));
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.setAttribute("placeholder", i18n(el.getAttribute("data-i18n-placeholder")));
    });
    scope.querySelectorAll("[data-i18n-value]").forEach(el => {
        el.setAttribute("value", i18n(el.getAttribute("data-i18n-value")));
    });
    // data-i18n-btn: translates the text node inside a button element
    scope.querySelectorAll("[data-i18n-btn]").forEach(el => {
        // buttons may contain an icon element — only update the text node
        const key = el.getAttribute("data-i18n-btn");
        const text_node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (text_node) {
            text_node.textContent = i18n(key);
        } else {
            el.textContent = i18n(key);
        }
    });
    // data-i18n-checkbox: translates the label text next to a checkbox input
    scope.querySelectorAll("[data-i18n-checkbox]").forEach(el => {
        const key = el.getAttribute("data-i18n-checkbox");
        // weaver renders checkboxes as <label><input>Label text</label> or similar
        // update the text node inside the label (leaving any child inputs intact)
        const label = el.closest("label") || el.querySelector("label") || el;
        const text_node = Array.from(label.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (text_node) {
            text_node.textContent = " " + i18n(key);
        } else {
            label.textContent = i18n(key);
        }
    });

    // Translate weaver tab nav links. Weaver renders tabs as plain <a> text
    // inside a nav, so we patch them by their stable English label using a
    // lookup table keyed by the English text we know was rendered at build time.
    const tab_keys = {
        "Search":     "tab_search",
        "History":    "tab_history",
        "Favourites": "tab_favourites",
        "Advanced":   "tab_advanced"
    };
    document.querySelectorAll("ul.nav-tabs li a, ul.nav a").forEach(a => {
        const english = a.getAttribute("data-i18n-original") || a.textContent.trim();
        if (tab_keys[english]) {
            // store original English text on first pass so subsequent calls stay stable
            if (!a.getAttribute("data-i18n-original")) {
                a.setAttribute("data-i18n-original", english);
            }
            a.textContent = i18n(tab_keys[english]);
        }
    });
}
