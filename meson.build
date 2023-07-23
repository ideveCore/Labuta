project('pomodoro',
<<<<<<< HEAD
          version: '1.1.0',
    meson_version: '>= 0.63.0',
=======
  version: '1.2.0',
  meson_version: '>= 0.63.0',
>>>>>>> new-pomodoro
  default_options: [ 'warning_level=2', 'werror=false', ],
)

i18n = import('i18n')
gnome = import('gnome')

<<<<<<< HEAD
=======
if get_option('profile') == 'development'
  profile = 'Devel'
  vcs_tag = run_command('git', 'rev-parse', '--short', 'HEAD', check: true).stdout().strip()
  if vcs_tag == ''
    version_suffix = '-devel'
  else
    version_suffix = '-@0@'.format (vcs_tag)
  endif
else
  profile = ''
  version_suffix = ''
endif

application_id = 'io.gitlab.idevecore.Pomodoro@0@'.format(profile)
version =  meson.project_version() + version_suffix
prefix = get_option('prefix')
bindir = prefix / get_option('bindir')
libdir = prefix / get_option('libdir')
datadir = prefix / get_option('datadir')
pkgdatadir = datadir / application_id

>>>>>>> new-pomodoro
subdir('data')
subdir('src')
subdir('po')

<<<<<<< HEAD
gnome.post_install(
     glib_compile_schemas: true,
    gtk_update_icon_cache: true,
=======

install_symlink(
  meson.project_name(),
  pointing_to: pkgdatadir / application_id,
  install_dir: bindir
)

gnome.post_install(
  glib_compile_schemas: true,
  gtk_update_icon_cache: true,
>>>>>>> new-pomodoro
  update_desktop_database: true,
)
