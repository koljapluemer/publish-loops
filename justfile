set shell := ["bash", "-euo", "pipefail", "-c"]

app := "loop-manager"
config_dir := env_var_or_default("XDG_CONFIG_HOME", env_var("HOME") / ".config") / app

# List recipes
default:
    @just --list

# Run the app in dev mode
dev: deps
    npm start

# Build a native package for this distro (deb or rpm) and (re)install it
reinstall: deps
    #!/usr/bin/env bash
    set -euo pipefail
    . /etc/os-release
    case " ${ID} ${ID_LIKE:-} " in
      *" fedora "*|*" rhel "*) just _reinstall-rpm ;;
      *" debian "*|*" ubuntu "*) just _reinstall-deb ;;
      *) echo "Unsupported distro '${ID}': expected Fedora or Ubuntu/Debian based." >&2; exit 1 ;;
    esac
    just _seed-config

[private]
deps:
    npm install

[private]
_reinstall-deb:
    rm -rf out/make
    npm run make -- --targets=@electron-forge/maker-deb
    sudo apt-get install -y --reinstall "$(realpath "$(find out/make/deb -name '*.deb' | head -n1)")"

[private]
_reinstall-rpm:
    rm -rf out/make
    command -v rpmbuild >/dev/null || sudo dnf install -y rpm-build
    npm run make -- --targets=@electron-forge/maker-rpm
    sudo dnf remove -y {{app}} || true
    sudo dnf install -y "$(realpath "$(find out/make/rpm -name '*.rpm' | head -n1)")"

# The installed app reads config.yml from its per-user config dir; seed it from the repo's once.
[private]
_seed-config:
    mkdir -p "{{config_dir}}"
    if [ -f config.yml ] && [ ! -f "{{config_dir}}/config.yml" ]; then cp config.yml "{{config_dir}}/config.yml"; fi
