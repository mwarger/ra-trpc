import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export function createReactAdminRouter(key: string, router: any) {
	return (
		router
			// create
			.mutation('create', {
				input: z.record(z.string().or(z.number()).or(z.boolean())),
				async resolve({ ctx, input }: any) {
					const record = await ctx.prisma[key].create({
						data: input,
					});
					return record;
				},
			})
			// read
			.query('getMany', {
				input: z.object({
					select: z.array(z.string()).min(1).optional(),
				}),
				async resolve({ ctx, input }: any) {
					/**
					 * For pagination you can have a look at this docs site
					 * @link https://trpc.io/docs/useInfiniteQuery
					 */
					return ctx.prisma[key].findMany({
						select: input.select
							? input.select.reduce(
									(prev: Record<string, boolean>, cur: string) => ({
										...prev,
										[cur]: true,
									}),
									{}
							  )
							: undefined,
					});
				},
			})
			.query('getOne', {
				input: z.object({
					id: z.string().min(1).or(z.number().min(1)),
					select: z.array(z.string()).min(1).optional(),
				}),
				async resolve({ ctx, input }: any) {
					const record = await ctx.prisma[key].findUnique({
						where: { id: input.id },
						select: input.select
							? input.select.reduce(
									(prev: Record<string, boolean>, cur: string) => ({
										...prev,
										[cur]: true,
									}),
									{}
							  )
							: undefined,
					});
					if (!record) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: `No ${key} with id '${input}'`,
						});
					}
					return { data: record };
				},
			})
			// update
			.mutation('update', {
				input: z.object({
					id: z.string().min(1).or(z.number().min(1)),
					data: z.record(z.string().or(z.number()).or(z.boolean())),
				}),
				async resolve({ ctx, input }: any) {
					const { id, data } = input;
					const record = await ctx.prisma[key].update({
						where: { id },
						data,
					});
					return record;
				},
			})
			// delete
			.mutation('delete', {
				input: z.string().min(1).or(z.number().min(1)),
				async resolve({ input: id, ctx }: any) {
					await ctx.prisma[key].delete({ where: { id } });
					return { data: id };
				},
			})
	);
}
