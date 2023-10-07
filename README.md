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
<a href='https://flathub.org/apps/io.gitlab.idevecore.Pomodoro'><img width='240' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

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

## Translations

[![Translation status](https://hosted.weblate.org/widget/pomodoro/pomodoro/svg-badge.svg)](https://hosted.weblate.org/engage/pomodoro/) ✨Powered by [Weblate](https://weblate.org/en/)✨

Pomodoro has been translated into the following languages:

<a href="https://hosted.weblate.org/engage/pomodoro/">
<img src="https://hosted.weblate.org/widget/pomodoro/pomodoro/multi-auto.svg" alt="Translation status" />
</a>

Please help translate Pomodoro into more languages through [Weblate](https://hosted.weblate.org/engage/pomodoro/).

## Donate
If you like this project and have some spare money left, consider donating:

### Ko-fi or Patreon
<a href='https://ko-fi.com/idevecore'><img width='60' alt='To Ko-fi' src='https://storage.ko-fi.com/cdn/nav-logo-stroke.png'/></a>
<a href='https://patreon.com/IdeveCore'><img width='60' alt='To Patreon' src='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flogosmarcas.net%2Fwp-content%2Fuploads%2F2020%2F11%2FPatreon-Logo-2013-2017.jpg&f=1&nofb=1&ipt=e6f7675606e3f61043f355654594c8e91710618e09f88bf646b65f6e4e664782&ipo=images'/></a>

## License 
 [GNU General Public License 3 or later](https://www.gnu.org/licenses/gpl-3.0.en.html)
