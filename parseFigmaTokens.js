import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

const parseTokens = (input, output) => {
	return readFile(input, "utf-8").then(data => {
		const parsedToken = JSON.parse(data).global;

		mkdir(dirname(output), { recursive: true }).then(() =>
			writeFile(
				output,
				"export default " +
					JSON.stringify(
						parsedToken,
						(key, value) => {
							if (key === "value" && value.constructor === Object) {
								return Object.fromEntries(
									Object.entries(value)
										.map(([k, v]) => [
											k,
											v.replace(
												/{[^}]+}/g,
												match =>
													match
														.slice(1, -1)
														.split(".")
														.reduce((target, key) => target?.[key], parsedToken)
														?.value ?? ""
											),
										])
										.filter(([_, value]) => value !== "")
								);
							} else if (
								value.constructor === Object &&
								typeof value.value === "string"
							) {
								return value.value;
							} else {
								return value;
							}
						},
						2
					)
			)
		);
	});
};

export default parseTokens;
