<<<<<<< HEAD
pkgdatadir = join_paths(get_option('datadir'), meson.project_name())
gnome = import('gnome')

src_res = gnome.compile_resources('io.gitlab.idevecore.Pomodoro.src',
  'io.gitlab.idevecore.Pomodoro.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

data_res = gnome.compile_resources('io.gitlab.idevecore.Pomodoro.data',
  'io.gitlab.idevecore.Pomodoro.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
=======
blueprint_compiler = find_program('blueprint-compiler')
gjspack = find_program('../troll/gjspack/bin/gjspack')
gresource = custom_target('gjspack',
  input: ['main.js', '../po/POTFILES'],
  output: application_id + '.src.gresource',
  command: [
    gjspack,
    '--appid=' + application_id,
    '--project-root', meson.source_root(),
    '--resource-root', meson.project_source_root() / 'src',
    '--blueprint-compiler', blueprint_compiler,
    '--no-executable',
    '@INPUT0@',
    '--potfiles', '@INPUT1@',
    '@OUTDIR@',
  ],
  install: true,
  install_dir: pkgdatadir,
  build_always_stale: true,
>>>>>>> new-pomodoro
)

bin_conf = configuration_data()
bin_conf.set('GJS', find_program('gjs').full_path())
<<<<<<< HEAD
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))
bin_conf.set('resource_path', '/io/gitlab/idevecore/Pomodoro')

configure_file(
  input: 'io.gitlab.idevecore.Pomodoro.in',
  output: 'io.gitlab.idevecore.Pomodoro',
  configuration: bin_conf,
  install: true,
  install_dir: get_option('bindir')
)
=======
bin_conf.set('version', version)
bin_conf.set('profile', profile)
bin_conf.set('app_id', application_id)
bin_conf.set('prefix', prefix)
bin_conf.set('libdir', libdir)
bin_conf.set('datadir', datadir)

configure_file(
  input: 'io.gitlab.idevecore.Pomodoro',
  output: application_id,
  configuration: bin_conf,
  install: true,
  install_dir: pkgdatadir
)

subdir('icons')
>>>>>>> new-pomodoro
