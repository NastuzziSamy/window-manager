const { Clutter, Meta, Gio, GObject, GLib, St } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { SignalMixin, KeybindingMixin } = Me.imports.src.mixins;
const { EDIT_TITLEBAR_PROPRIETY, FOCUS_SELECTION_WINDOW, SELECTIONS, KEYBINDINGS_SCHEMA_KEY } = Me.imports.src.consts;
const helper = Me.imports.src.helper;


var WindowManager = class {
    constructor(settings) {
        this.settings = settings;

        this.connectSignals();
        this.addKeybindings();

        this.hideWindowsTitleBar();
    }

    destroy() {
        this.removeKeybindings();
        this.disconnectSignals();

        this.hideWindowsTitleBar(false);
    }

    connectSignals() {
        this.connectSignal(global.display, 'window-created', (_, window) => this.hideWindowTitleBar(window));
    }

    addKeybindings() {
        const settings = this.settings.get(KEYBINDINGS_SCHEMA_KEY);

        for (const key in SELECTIONS) {
            const selection = SELECTIONS[key];

            this.addKeybinding(
                FOCUS_SELECTION_WINDOW.replace('${selection}', selection),
                settings,
                () => this['focus' + helper.upperWords(selection) + 'Window']()
            );
        }
    }

    focusPreviousWindow() {
        const window = helper.getPreviousWindow();
        if (!window) return false;

        helper.focusWindow(window);

        return true;
    }

    focusNextWindow() {
        const window = helper.getNextWindow();
        if (!window) return false;

        helper.focusWindow(window);

        return true;
    }

    focusLeftWindow() {
        const window = helper.getDirectLeftWindow();
        if (!window) return false;

        helper.focusWindow(window);

        return true;
    }

    focusRightWindow() {
        const window = helper.getDirectRightWindow();
        if (!window) return false;

        global.a = window;

        helper.focusWindow(window);

        return true;
    }

    focusTopWindow() {
        const window = helper.getDirectTopWindow();
        if (!window) return false;

        helper.focusWindow(window);

        return true;
    }

    focusBottomWindow() {
        const window = helper.getDirectBottomWindow();
        if (!window) return false;

        helper.focusWindow(window);

        return true;
    }

    hideWindowTitleBar(window, hide=true) {
        if (!window.decorated) return;

        let id = helper.getWindowId(window);
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
};

Object.assign(WindowManager.prototype, SignalMixin);
Object.assign(WindowManager.prototype, KeybindingMixin);
