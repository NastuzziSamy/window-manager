const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { WindowManager } = Me.imports.src.manager;
const { Settings } = Me.imports.src.settings;
const { WINDOW_SCHEMA_KEY, SCHEMAS } = Me.imports.src.consts;
const { settings, setSettings } = Me.imports.src.helper;


var Extension = class {
    constructor() {
        this.loadSettings();

        if (!global.managers) {
            global.managers = {};
        }

        if (settings.debug) {
            global.managers._window = Me;
        }
    }

    loadSettings() {
        Me.settings = new Settings(SCHEMAS);

        for (const key in settings) {
            Me.settings.follow(WINDOW_SCHEMA_KEY, key, (value) => setSettings(key, value));
        }
    }

    enable() {
        global.managers.window = new WindowManager();

        global.managers.window.manage();
    }

    disable() {
        Me.settings.disconnectSignals();

        if (!global.managers) return;

        if (global.managers.window) {
            global.managers.window.unmanage();
        }

        global.managers.window = undefined;
    }
};
