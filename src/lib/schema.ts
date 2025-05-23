import { co, Group, z } from 'jazz-tools';
import { getRandomUsername } from './username';

export const Reaction = co.map({
	emoji: z.string()
});

export const Message = co.map({
	content: co.richText(),
	images: co.list(co.image()),

	createdAt: z.date(),
	updatedAt: z.date(),

	replyTo: z.string().optional(),
	reactions: co.list(Reaction),
	type: z.enum(['message', 'announcement'])
});

export const Timeline = co.list(Message);

export const Thread = co.map({
	name: z.string(),
	timeline: Timeline
});

export const Channel = co.map({
	name: z.string(),
	image: co.image().optional(),

	mainThread: Thread,
	subThreads: co.list(Thread)
});

export const Space = co.map({
	name: z.string(),
	image: co.image().optional(),
	channels: co.list(Channel),
	description: z.string().optional(),
	emoji: z.string().optional(),
	members: co.list(co.account())
});

export const SpaceList = co.list(Space);

export const MyAppProfile = co.profile({
	name: z.string(),
	image: co.image().optional(),
	imageUrl: z.string().optional(),
	blueskyHandle: z.string().optional()
});

export const LastReadList = co.record(z.string(), z.date());

export const MyAppRoot = co.map({
	joinedSpaces: SpaceList,
	lastRead: LastReadList
});

export const MyAppAccount = co
	.account({
		profile: MyAppProfile,
		root: MyAppRoot
	})
	.withMigration((account, creationProps?: { name: string }) => {
		if (account.root === undefined) {
			account.root = MyAppRoot.create({
				joinedSpaces: SpaceList.create([]),
				lastRead: LastReadList.create({})
			});
		}

		if (account.profile === undefined) {
			const profileGroup = Group.create();
			profileGroup.addMember('everyone', 'reader');

			account.profile = MyAppProfile.create(
				{
					name: creationProps?.name ?? getRandomUsername()
				},
				profileGroup
			);
		}
	});
