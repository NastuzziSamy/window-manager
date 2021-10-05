const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { WindowManager } = Me.imports.src.manager;
const { Settings } = Me.imports.src.settings;
const { WINDOW_SCHEMA_KEY, SCHEMAS } = Me.imports.src.consts;
const { settings, setSettings } = Me.imports.src.helper;


var Extension = class {
    constructor() {
        this.loadSettings();

        if (settings.debug) {
            global.managers._window = Me;
        }
    }

    loadSettings() {
        this.settings = new Settings(SCHEMAS);

        for (const key in settings) {
            this.settings.follow(WINDOW_SCHEMA_KEY, key, (value) => setSettings(key, value));
        }
    }

    enable() {
        if (!global.managers) {
            global.managers = {};
        }

        global.managers.window = new WindowManager(this.settings);
    }

    disable() {
        if (!global.managers) return;

        if (global.managers.window) {
            global.managers.window.destroy();
        }

        global.managers.window = undefined;
    }
};
