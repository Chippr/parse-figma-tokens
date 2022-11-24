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
							if (value.constructor === Object && value.value !== undefined) {
								if (typeof value.value === "string") {
									return value.value;
								}
								return Object.fromEntries(
									Object.entries(value.value)
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
