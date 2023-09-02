<img heigth="128" src="./data/icons/hicolor/scalable/apps/io.gitlab.idevecore.Pomodoro.svg" align="left" />

# Pomodoro

A simple timer application, its main objective is to be simple, and intuitive.

![Pomodoro](data/screenshots/01.png)

## Features
- History
- Statistics
- Run in background
- Feedback sounds
- Progress notification

## Flathub
<a href='https://flathub.org/apps/io.github.idevecore.Pomodoro'><img width='240' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

## Building

###  Requirements
- Gjs `gjs` 
- GTK4 `gtk4` 
- libadwaita (>= 1.2.0) `libadwaita`
- Meson `meson` 
- Ninja `ninja` 
- D-Bus `python-dbus`

### Building from Git
```bash 
 git clone --recurse-submodules https://gitlab.com/idevecore/pomodoro.git
 cd pomodoro
 meson builddir --prefix=/usr/local 
 sudo ninja -C builddir install 
 ```

## Donate
If you like this project and have some spare money left, consider donating:

### Ko-fi and Github Sponsors
<a href='https://ko-fi.com/idevecore'><img width='60' alt='Download on Flathub' src='https://storage.ko-fi.com/cdn/nav-logo-stroke.png'/></a>
<a href='https://github.com/sponsors/ideveCore'><img width='60' alt='Download on Flathub' src='https://github.githubassets.com/images/email/sponsors/mona.png'/></a>

## License 
 [GNU General Public License 3 or later](https://www.gnu.org/licenses/gpl-3.0.en.html)
