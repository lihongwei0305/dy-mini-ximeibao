"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surql = exports.surrealql = void 0;
const PreparedQuery_js_1 = require("./PreparedQuery.js");
function surrealql(query_raw, ...values) {
    const mapped_bindings = values.map((v, i) => [`__tagged_template_literal_binding__${i}`, v]);
    const bindings = mapped_bindings.reduce((prev, [k, v]) => ({
        ...prev,
        [k]: v,
    }), {});
    const query = query_raw
        .flatMap((segment, i) => {
        const variable = mapped_bindings[i]?.[0];
        return [
            segment,
            ...(variable ? [`$${variable}`] : []),
        ];
    })
        .join("");
    return new PreparedQuery_js_1.PreparedQuery(query, bindings);
}
exports.surrealql = surrealql;
exports.surql = surrealql;
//# sourceMappingURL=tagged-template.js.map