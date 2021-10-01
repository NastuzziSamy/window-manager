const { Clutter } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { WindowManager } = Me.imports.src.manager;
const { Settings } = Me.imports.src.settings;
const { SCHEMAS } = Me.imports.src.consts;


var Extension = class {
    constructor() {
        this.loadSettings();
    }

    loadSettings() {
        this.settings = new Settings(SCHEMAS);
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
