// Require modules
const path = require('path');
const fs = require('fs').promises;
const { graphql } = require('@octokit/graphql');

const getToken = () => process.env.GITHUB_API_TOKEN;

/**
 * Reads a GraphQL file by the name.
 *
 * @param {string} name
 * @returns {Promise<string>}
 */
const readFile = async (name) => {
	const buffer = await fs.readFile(
		path.join(process.cwd(), 'resources/graphql', name + '.graphql')
	);
	return buffer.toString('utf8');
};

/**
 * @typedef {(file: string, variables: object?) => Promise<import('@octokit/graphql/dist-types/types').GraphQlResponse<any>>} GraphQLHandler
 */

module.exports = () => {
	/**
	 * Executes a GraphQL query from the given file and returns the result.
	 *
	 * @param {string} file The name of a file which contains the GraphQL query to execute.
	 * @param {object} variables An optional object of variables to pass to the query.
	 * @returns {import('@octokit/graphql/dist-types/types').GraphQlResponse<any>}
	 */
	return async (file, variables = {}) => {
		return await graphql(await readFile(file), {
			...variables,
			headers: {
				authorization: `token ${getToken()}`,
			},
		});
	};
};
