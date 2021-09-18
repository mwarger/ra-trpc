import { DataProvider } from 'react-admin';

/**
 * Maps react-admin queries to a json-server powered REST API
 *
 * @see https://github.com/typicode/json-server
 *
 * @example
 *
 * getList          => GET http://my.api.url/posts?_sort=title&_order=ASC&_start=0&_end=24
 * getOne           => GET http://my.api.url/posts/123
 * getManyReference => GET http://my.api.url/posts?author_id=345
 * getMany          => GET http://my.api.url/posts?id=123&id=456&id=789
 * create           => POST http://my.api.url/posts/123
 * update           => PUT http://my.api.url/posts/123
 * updateMany       => PUT http://my.api.url/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
 * delete           => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import * as React from "react";
 * import { Admin, Resource } from 'react-admin';
 * import jsonServerProvider from 'ra-data-json-server';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
export function createTRPCDataProvider(
	trpcClient: any,
	resources: Record<string, string[]>
): DataProvider {
	return {
		getList: (resource, params) => {
			// const { page, perPage } = params.pagination
			// const { field, order } = params.sort
			// const query = {
			//   ...fetchUtils.flattenObject(params.filter),
			//   _sort: field,
			//   _order: order,
			//   _start: (page - 1) * perPage,
			//   _end: page * perPage,
			// }
			// const url = `${apiUrl}/${resource}?${stringify(query)}`
			// return httpClient(url).then(({ headers, json }) => {
			//   if (!headers.has('x-total-count')) {
			//     throw new Error(
			//       'The X-Total-Count header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare X-Total-Count in the Access-Control-Expose-Headers header?',
			//     )
			//   }
			//   return {
			//     data: json,
			//     total: parseInt(
			//       headers.get('x-total-count')?.split('/').pop() ?? '',
			//       10,
			//     ),
			//   }
			// })
			return trpcClient.query(`${resource}getMany`).then((results: any) => {
				return {
					data: results,
					total: parseInt(results.length ?? '', 10),
				};
			});
		},

		getOne: (resource, params) => {
			return trpcClient.query(`${resource}getOne`, {
				id: params.id,
				select: resources[resource],
			});
		},

		getMany: (resource, params) => {
			console.log('getting many', resource, params);
			const query = {
				id: params.ids,
			};
			return trpcClient.query([`${resource}getMany`, query]);
		},

		getManyReference: (resource, params) => {
			const { page, perPage } = params.pagination;
			const { field, order } = params.sort;
			const query = {
				id: params.id,
			};
			// const url = `${apiUrl}/${resource}?${stringify(query)}`

			return trpcClient
				.query([`${resource}getMany`, query])
				.then((results: any) => {
					return {
						data: results,
						total: parseInt(results.count ?? '', 10),
					};
				});
		},

		update: (resource, params) => {
			return trpcClient
				.mutation(`${resource}update`, params)
				.then((response: any) => ({ data: response }));
		},

		// json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
		updateMany: (resource, params) =>
			Promise.all(
				params.ids.map(id => trpcClient.mutation(`${resource}update`, id))
			).then(responses => ({ data: responses.map(({ json }) => json.id) })),

		create: (resource, params) => {
			return trpcClient
				.mutation(`${resource}create`, params.data)
				.then((response: any) => ({ data: response }));
		},

		delete: (resource, params) => {
			return trpcClient
				.mutation(`${resource}delete`, params.id)
				.then((response: any) => ({ data: response }));
		},

		// json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
		deleteMany: (resource, params) =>
			Promise.all(
				params.ids.map(id => trpcClient.mutation(`${resource}delete`, id))
			).then(responses => ({ data: responses.map(item => item) })),
	};
}
