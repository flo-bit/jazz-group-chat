import { Extension } from '@tiptap/core';
import { keymap } from '@tiptap/pm/keymap';

/* Keyboard Shortcuts: used to add and override existing shortcuts */
type KeyboardShortcutHandlerProps = {
	onEnter: () => void;
};

export const initKeyboardShortcutHandler = ({ onEnter }: KeyboardShortcutHandlerProps) =>
	Extension.create({
		name: 'keyboardShortcutHandler',
		addProseMirrorPlugins() {
			return [
				keymap({
					Enter: () => {
						onEnter();
						this.editor.commands.clearContent();
						return true;
					}
				})
			];
		}
	});
