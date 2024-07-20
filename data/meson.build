desktop_conf = configuration_data()
desktop_conf.set('app_id', application_id)
desktop_file = i18n.merge_file(
  input: configure_file(
    input: files('io.github.idevecore.Labuta.desktop.in.in'),
    output: 'io.github.idevecore.Labuta.desktop.in',
    configuration: desktop_conf
  ),
  output: '@0@.desktop'.format(application_id),
  po_dir: join_paths(meson.project_source_root(), 'po'),
  type: 'desktop',  po_dir: '../po',
  install: true,
  install_dir: join_paths(get_option('datadir'), 'applications')
)

desktop_utils = find_program('desktop-file-validate', required: false)
if desktop_utils.found()
  test('Validate desktop file', desktop_utils, args: [desktop_file])
endif

appstream_conf = configuration_data()
appstream_conf.set('app_id', application_id)
appstream_file = i18n.merge_file(
  input: configure_file(
    input: 'io.github.idevecore.Labuta.appdata.xml.in.in',
    output: 'io.github.idevecore.Labuta.appdata.xml.in',
    configuration: appstream_conf
  ),
  output: '@0@.metainfo.xml'.format(application_id),
  po_dir: '../po',
  install: true,
  install_dir: datadir / 'metainfo'
)

appstream_util = find_program('appstream-util', required: false)
if appstream_util.found()
  test('Validate appstream file', appstream_util, args: ['validate', appstream_file])
endif

gschema_conf = configuration_data()
gschema_conf.set('app_id', application_id)
configure_file(
  input: 'io.github.idevecore.Labuta.gschema.xml',
  output: '@0@.gschema.xml'.format(application_id),
  configuration: gschema_conf,
  install: true,
  install_dir: datadir / 'glib-2.0/schemas'
)

compile_schemas = find_program('glib-compile-schemas', required: false)
if compile_schemas.found()
  test('Validate schema file',
       compile_schemas,
       args: ['--strict', '--dry-run', meson.current_source_dir()])
endif

subdir('icons')
