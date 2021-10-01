var WINDOW_SCHEMA_KEY = 'window';
var KEYBINDINGS_SCHEMA_KEY = 'keybindings';

var SCHEMAS = {
    [WINDOW_SCHEMA_KEY]: 'org.gnome.shell.extensions.managers.window',
    [KEYBINDINGS_SCHEMA_KEY]: 'org.gnome.shell.extensions.managers.window.keybindings',
};


var EDIT_TITLEBAR_PROPRIETY = '_MOTIF_WM_HINTS';


var FOCUS_SELECTION_WINDOW = 'focus-${selection}-window';
var DIRECTIONS = ['right', 'left', 'top', 'bottom'];
var SELECTIONS = ['previous', 'next', ...DIRECTIONS];