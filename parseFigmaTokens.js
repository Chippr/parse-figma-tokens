import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

const ensureValidKey = key => key.replace(/^\d/, match => `_${match}`);

const camelCase = key =>
	key.replace(/(?:\s+|-)[a-z0-9]/gi, match => match.slice(-1).toUpperCase());

const pascalCase = key => {
	const camelCasedKey = camelCase(key);

	return camelCasedKey[0].toUpperCase() + camelCasedKey.slice(1);
};

const recursionHelper = (target, accumulator, rootKey) => {
	return Object.entries(target).forEach(([key, value]) => {
		if (value.constructor !== Object) return;
		if (value.type !== undefined) {
			const entityName = pascalCase(rootKey ?? key);

			accumulator[entityName] ??= {};
			accumulator[entityName][ensureValidKey(pascalCase(key))] =
				value.value.constructor === Object
					? Object.fromEntries(
							Object.entries(value.value)
								.map(([k, v]) => [
									camelCase(k),
									v.replace(
										/{[^}]+}/g,
										match =>
											`{${match
												.slice(1, -1)
												.split(".")
												.map(key => ensureValidKey(pascalCase(key)))
												.join(".")}}`
									),
								])
								.filter(([_, value]) => value !== "")
					  )
					: value.value;
		} else {
			recursionHelper(value, accumulator, rootKey ?? key);
		}
	});
};

const hasComputedMembers = value =>
	Object.values(value).some(value => value.constructor === Object);

const stringifyTsFile = accumulatorObj => {
	return Object.entries(accumulatorObj)
		.sort((a, b) =>
			hasComputedMembers(a[1]) ? (hasComputedMembers(b[1]) ? 0 : 1) : -1
		)
		.map(([key, value]) => {
			const isComputed = hasComputedMembers(value);
			const storage = isComputed ? "const " : "const enum ";

			return (
				"export " +
				storage +
				key +
				(isComputed ? " =" : "") +
				" {\n  " +
				Object.entries(value)
					.map(
						([key, value]) =>
							key +
							` ${isComputed ? ":" : "="} ` +
							(value.constructor === Object
								? JSON.stringify(value, (_, value) => {
										if (typeof value !== "string" || !value.startsWith("{")) {
											return value;
										}

										const mainKey = value.slice(1, -1).split(".")[0];
										return accumulatorObj[mainKey] ? value : undefined;
								  }).replace(/"{|}"/g, "")
								: String(Number(value)) === value
								? value
								: `"${value}"`)
					)
					.join(",\n  ") +
				"\n}"
			);
		})
		.join("\n\n");
};

const stringifyScssFile = accumulatorObj =>
	":root {\n" +
	Object.entries(accumulatorObj)
		.filter(([_, value]) => !hasComputedMembers(value))
		.map(([key, value]) =>
			Object.entries(value)
				.map(
					([propertyName, propertyValue]) =>
						`  --${key}-${propertyName}: ${propertyValue.toLowerCase()};`
				)
				.join("\n")
		)
		.join("\n") +
	"\n}";

const parseTokens = (input, output) => {
	return readFile(input, "utf-8").then(data => {
		const parsedToken = JSON.parse(data).global;

		return mkdir(dirname(output), { recursive: true }).then(() => {
			const accumulatorObj = {};
			recursionHelper(parsedToken, accumulatorObj);

			return Promise.all([
				writeFile(output + ".ts", stringifyTsFile(accumulatorObj)),
				writeFile(output + ".scss", stringifyScssFile(accumulatorObj)),
			]);
		});
	});
};

export default parseTokens;