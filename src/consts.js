var WINDOW_SCHEMA_KEY = 'window';
var KEYBINDINGS_SCHEMA_KEY = 'keybindings';

var SCHEMAS = {
    [WINDOW_SCHEMA_KEY]: 'org.gnome.shell.extensions.managers.window',
    [KEYBINDINGS_SCHEMA_KEY]: 'org.gnome.shell.extensions.managers.window.keybindings',
};


var EDIT_TITLEBAR_PROPRIETY = '_MOTIF_WM_HINTS';



var RIGHT_DIRECTION = 'right';
var LEFT_DIRECTION = 'left';
var TOP_DIRECTION = 'top';
var BOTTOM_DIRECTION = 'bottom';
var DIRECTIONS = [RIGHT_DIRECTION, LEFT_DIRECTION, TOP_DIRECTION, BOTTOM_DIRECTION];

var PREVIOUS_SELECTION = 'previous';
var NEXT_SELECTION = 'next';
var SELECTIONS = [PREVIOUS_SELECTION, NEXT_SELECTION, ...DIRECTIONS];

var FOCUS_SELECTION_WINDOW = 'focus-${selection}-window';