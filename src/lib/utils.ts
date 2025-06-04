import { Account, co, CoRichText, Group, z, type Loaded } from 'jazz-tools';
import { Channel, Message, Reaction, Space, SpaceList, Thread, Timeline } from './schema';

export function publicGroup(readWrite: 'reader' | 'writer' = 'writer') {
	const group = Group.create();
	group.addMember('everyone', readWrite);

	return group;
}

export function createChannel(name: string) {
	const group = publicGroup();

	const thread = Thread.create(
		{
			name: 'main',
			timeline: Timeline.create([], {
				owner: group
			})
		},
		{
			owner: group
		}
	);

	const channel = Channel.create(
		{
			name,
			mainThread: thread,
			subThreads: co.list(Thread).create([], {
				owner: group
			})
		},
		{
			owner: group
		}
	);

	return channel;
}

export function createSpace(name: string, description?: string, emoji?: string) {
	const group = publicGroup();

	const channel = createChannel('general');

	const space = Space.create(
		{
			name,
			channels: co.list(Channel).create([channel], {
				owner: group
			}),
			description,
			emoji,
			members: co.list(co.account()).create([Account.getMe()], {
				owner: group
			}),
			version: 1
		},
		{
			owner: group
		}
	);

	return space;
}

export function joinSpace(space: Loaded<typeof Space>) {
	space.members?.push(Account.getMe());
}

export function isSpaceAdmin(space: Loaded<typeof Space>) {
	try {
		const me = Account.getMe();
		return me.canAdmin(space);
	} catch (error) {
		return false;
	}
}

export function createPublicSpacesList() {
	const spaces = SpaceList.create([], {
		owner: publicGroup()
	});

	return spaces;
}

export function createMessage(content: CoRichText, images: string[], replyTo?: string) {
	const message = Message.create(
		{
			content,
			createdAt: new Date(),
			updatedAt: new Date(),
			images: co.list(z.string()).create([...images], {
				owner: publicGroup()
			}),
			reactions: co.list(Reaction).create([], {
				owner: publicGroup()
			}),
			replyTo: replyTo,
			type: 'message'
		},
		{
			owner: publicGroup()
		}
	);

	return message;
}

export function createThread(messagesIds: string[], name?: string) {
	const thread = Thread.create(
		{
			name: name || 'New Thread',
			timeline: Timeline.create([...messagesIds], {
				owner: publicGroup()
			})
		},
		{
			owner: publicGroup()
		}
	);

	return thread;
}
