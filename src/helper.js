const { GLib } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const { RIGHT_DIRECTION, LEFT_DIRECTION, TOP_DIRECTION, BOTTOM_DIRECTION, PREVIOUS_SELECTION, NEXT_SELECTION } = Me.imports.src.consts;


var settings = {
    debug: null,
    'cycle-focus-windows': null,
};

var setSettings = (key, value) => {
    if (key === 'debug') {
        log('DEBUG ' + (value ? 'activated' : 'desactivated'));
    }

    settings[key] = value;
};


var formatLog = (text) => '[' + Me.metadata.uuid + '] ' + text;

var log = (text, ...args) => console.log(formatLog(text), ...args);

var warn = (text, ...args) => console.warn(formatLog(text), ...args);

var debug = (text, ...args) => {
    if (settings.debug) {
        log('DEBUG: ' + text, ...args);
    }
}


var camel = (text) => {
    return text.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
};

var upperWords = (text) => {
    const camelText = camel(text);

    return camelText[0].toUpperCase() + camelText.slice(1);
}


var focusWindow = (window) => window.activate(global.get_current_time());


var getNextWindow = (next = true) => {
    const workspace = global.workspace_manager.get_active_workspace();
    if (!workspace) return;

    const windows = workspace.list_windows();
    const length = windows.length;

    for (let i = 0; i < lengt&h; i++) {
        const window = windows[i];

        if (window.appears_focused) {
            return windows[(next ? i + 1 : i - 1) % length];
        }
    }
};

var getPreviousWindow = () => this.getNextWindow(false);

var getWindowGravity = (window) => {
    const box = window.get_frame_rect();

    return {
        x: box.x + (box.width / 2),
        y: box.y + (box.height / 2),
    };
};


var getWindowsGravities = () => {
    const workspace = global.workspace_manager.get_active_workspace();
    if (!workspace) return;

    const windows = workspace.list_windows();
    const data = [];

    for (const key in windows) {
        const window = windows[key];

        data.push({
            window,
            time: window.user_time,
            ...getWindowGravity(window),
        });
    }

    return data.sort((a, b) => a.time - b.time);
};


var getDirectWindow = (selection) => {
    const windowsGravities = this.getWindowsGravities();
    if (windowsGravities.length === 0) return;

    if (windowsGravities.length < 3)  {
        if (windowsGravities.length === 2 && ! windowsGravities[1].window.appears_focused) {
            return windowsGravities[1].window;
        }

        return windowsGravities[0].window;
    }

    const focusedWindow = windowsGravities.pop();
    const getBetterPosition = getBetterWindowPosition(selection);
    const getOppositePosition = getOppositeWindowPosition(selection);
    let candidate;

    for (const key in windowsGravities) {
        candidate = getBetterPosition(candidate, windowsGravities[key], focusedWindow);
    }

    if (! candidate) {
        candidate = focusedWindow;

        if (settings['cycle-focus-windows']) {
            for (const key in windowsGravities) {
                candidate = getOppositePosition(candidate, windowsGravities[key]);
            }
        }
    }

    return candidate.window;
};

var getBetterWindowPosition = (selection) => {
    switch (selection) {
        case RIGHT_DIRECTION:
            return (candidate, possibleCandidate, focusedWindow) => {
                return ((! candidate || possibleCandidate.x <= candidate.x) && possibleCandidate.x >= focusedWindow.x) ? possibleCandidate : candidate;
            };

        case LEFT_DIRECTION:
            return (candidate, possibleCandidate, focusedWindow) => {
                return ((! candidate || possibleCandidate.x >= candidate.x) && possibleCandidate.x <= focusedWindow.x) ? possibleCandidate : candidate;
            };

        case TOP_DIRECTION:
            return (candidate, possibleCandidate, focusedWindow) => {
                return ((! candidate || possibleCandidate.y >= candidate.y) && possibleCandidate.y <= focusedWindow.y) ? possibleCandidate : candidate;
            };

        case BOTTOM_DIRECTION:
            return (candidate, possibleCandidate, focusedWindow) => {
                return ((! candidate || possibleCandidate.y <= candidate.y) && possibleCandidate.y >= focusedWindow.y) ? possibleCandidate : candidate;
            };

        case PREVIOUS_SELECTION:
        case NEXT_SELECTION:
        default:
            helper.warn(`Selection not recognized for better window position, got: ${selection}`)

            return (candidate) => candidate;
    }
};

var getOppositeWindowPosition = (selection) => {
    switch (selection) {
        case RIGHT_DIRECTION:
            return (candidate, possibleCandidate) => {
                return possibleCandidate.x < candidate.x ? possibleCandidate : candidate;
            };

        case LEFT_DIRECTION:
            return (candidate, possibleCandidate) => {
                return possibleCandidate.x > candidate.x ? possibleCandidate : candidate;
            };

        case TOP_DIRECTION:
            return (candidate, possibleCandidate) => {
                return possibleCandidate.y > candidate.y ? possibleCandidate : candidate;
            };

        case BOTTOM_DIRECTION:
            return (candidate, possibleCandidate) => {
                return possibleCandidate.y < candidate.y ? possibleCandidate : candidate;
            };

        case PREVIOUS_SELECTION:
        case NEXT_SELECTION:
        default:
            helper.warn(`Selection not recognized for opposite window position, got: ${selection}`)

            return (candidate) => candidate;
    }
};


var getWindowId = (window) => {
    let result = (window.get_description() || '').match(/0x[0-9a-f]+/);

    if (result && result[0]) {
        return result[0];
    }

    // use xwininfo, take first child.
    let act = window.get_compositor_private();
    let xwindow = act && act['x-window'];

    if (xwindow) {
        let xwininfo = GLib.spawn_command_line_sync('xwininfo -children -id 0x%x'.format(xwindow));

        if (xwininfo[0]) {
            let str = ByteArray.toString(xwininfo[1]);

            /**
             * The X ID of the window is the one preceding the target window's title.
             * This is to handle cases where the window has no frame and so
             * act['x-window'] is actually the X ID we want, not the child.
             */
            let regexp = new RegExp('(0x[0-9a-f]+) +"%s"'.format(window.title));
            let m = str.match(regexp);

            if (m && m[1]) {
                return window._noTitleBarWindowID = m[1];
            }

            // Otherwise, just grab the child and hope for the best
            m = str.split(/child(?:ren)?:/)[1].match(/0x[0-9a-f]+/);

            if (m && m[0]) {
                return window._noTitleBarWindowID = m[0];
            }
        }
    }

    // Try enumerating all available windows and match the title. Note that this
    // may be necessary if the title contains special characters and `x-window`
    // is not available.
    result = GLib.spawn_command_line_sync('xprop -root _NET_CLIENT_LIST');

    if (result[0]) {
        let str = ByteArray.toString(result[1]);
        let windowList = str.match(/0x[0-9a-f]+/g);
        if (! windowList) return null;

        // For each window ID, check if the title matches the desired title.
        for (var i = 0; i < windowList.length; ++i) {
            let cmd = 'xprop -id "' + windowList[i] + '" _NET_WM_NAME _NO_TITLE_BAR_ORIGINAL_STATE';
            result = GLib.spawn_command_line_sync(cmd);

            if (result[0]) {
                let output = ByteArray.toString(result[1]);
                let isManaged = output.indexOf("_NO_TITLE_BAR_ORIGINAL_STATE(CARDINAL)") > -1;
                if (isManaged) {
                    continue;
                }

                let title = output.match(/_NET_WM_NAME(\(\w+\))? = "(([^\\"]|\\"|\\\\)*)"/);

                // Is this our guy?
                if (title && title[2] == window.title) {
                    return windowList[i];
                }
            }
        }
    }

    return null;
};