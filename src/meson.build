pkgdatadir = join_paths(get_option('datadir'), meson.project_name())
gnome = import('gnome')

src_res = gnome.compile_resources('com.gitlab.idevecore.Pomodoro.src',
  'com.gitlab.idevecore.Pomodoro.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

data_res = gnome.compile_resources('com.gitlab.idevecore.Pomodoro.data',
  'com.gitlab.idevecore.Pomodoro.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

bin_conf = configuration_data()
bin_conf.set('GJS', find_program('gjs').full_path())
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))
bin_conf.set('resource_path', '/com/gitlab/idevecore/Pomodoro')

configure_file(
  input: 'com.gitlab.idevecore.Pomodoro.in',
  output: 'com.gitlab.idevecore.Pomodoro',
  configuration: bin_conf,
  install: true,
  install_dir: get_option('bindir')
)
