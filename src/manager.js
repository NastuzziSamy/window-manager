const { Clutter, Meta, Gio, GObject, GLib, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { SignalMixin, KeybindingMixin } = Me.imports.src.mixins;
const { EDIT_TITLEBAR_PROPRIETY, FOCUS_SELECTION_WINDOW, SELECTIONS, WINDOW_SCHEMA_KEY, KEYBINDINGS_SCHEMA_KEY } = Me.imports.src.consts;
const { getDirectWindow, focusWindow, getWindowId, debug } = Me.imports.src.helper;


var WindowManager = class {
    manage() {
        this.connectSignals();
        this.addKeybindings();

        this.trackSettings();
    }

    unmanage() {
        this.removeKeybindings();
        this.disconnectSignals();

        this.showWindowsTitleBar();
    }

    connectSignals() {
    }

    addKeybindings() {
        const settings = Me.settings.get(KEYBINDINGS_SCHEMA_KEY);

        for (const key in SELECTIONS) {
            const selection = SELECTIONS[key];

            this.addKeybinding(
                FOCUS_SELECTION_WINDOW.replace('${selection}', selection),
                settings,
                () => this.focusWindowSelection(selection)
            );
        }
    }

    trackSettings() {
        let hideTopBarSignalId;

        Me.settings.follow(WINDOW_SCHEMA_KEY, 'hide-top-bar',
            () => {
                hideTopBarSignalId = this.connectSignal(global.display, 'window-created', (_, window) => this.hideWindowTitleBar(window));

                this.hideWindowsTitleBar();
            },
            () => {
                this.disconnectSignal(hideTopBarSignalId);

                this.showWindowsTitleBar();
            });
    }

    focusWindowSelection(selection) {
        const window = getDirectWindow(selection);
        if (!window) {
            debug(`Not ${selection} window to focus on`);

            return false;
        }

        debug(`Focusing ${selection} window`);
        focusWindow(window);

        return true;
    }

    hideWindowTitleBar(window, hide=true) {
        if (!window.decorated) return;

        let id = getWindowId(window);
        if (!id) return;

        GLib.spawn_command_line_sync(
            `xprop -id ${id} -f ${EDIT_TITLEBAR_PROPRIETY} 32c -set ${EDIT_TITLEBAR_PROPRIETY} "0x2, 0x0, ${hide ? '0x2' : '0x1'}, 0x0, 0x0"`
        );

        if (!hide && !window.titlebar_is_onscreen()) {
            window.shove_titlebar_onscreen();
        }
    }

    hideWindowsTitleBar(hide=true) {
        const number = global.workspace_manager.n_workspaces;

        for (let i = 0; i < number; i++) {
            const workspace = global.workspace_manager.get_workspace_by_index(i);
            const windows = workspace.list_windows();

            for (const key in windows) {
                this.hideWindowTitleBar(windows[key], hide);
            }
        }
    }

    showWindowsTitleBar() {
        this.hideWindowsTitleBar(false);
    }
};

Object.assign(WindowManager.prototype, SignalMixin);
Object.assign(WindowManager.prototype, KeybindingMixin);
