# workspace-manager
GNOME workspace manager

# Development

gsettings --schemadir schemas set org.gnome.shell.extensions.managers.window debug true

journalctl -f | grep '\[managers'