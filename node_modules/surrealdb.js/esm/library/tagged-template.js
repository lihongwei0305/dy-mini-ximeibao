import { PreparedQuery } from "./PreparedQuery.js";
export function surrealql(query_raw, ...values) {
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
    return new PreparedQuery(query, bindings);
}
export { surrealql as surql };
//# sourceMappingURL=tagged-template.js.map