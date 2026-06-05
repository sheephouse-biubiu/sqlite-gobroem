var addHeadersToResultTable, addRowsToResultTable, apiCall, authMode, buildResultHeader, buildResultRow,
  buildTableContent, buildTableQueryResult, buildTableStructure, bytesToSize, cancelEditRow,
  currentTableContentColumns, currentTableContentName, currentTablePKColumns, editorInstance, escapeIdentifier,
  escapeSQLString, executeQuery, exportCSV, exportJSON, formatCellValue, getColumnsFromIndexSql,
  getInfo, getQuery, getTable, getTableContent, getTableIndexes, getTableInfo, getTableSql, getTables,
  initAuthFlow, isNumericString, loadQueryHistory, loadTables, pushQueryHistory, renderQueryHistory,
  applySchemaChange, populateSchemaColumnSelectors,
  rebuildTableForColumnType,
  resetResultTable, revertRowFromSnapshot, rowSnapshots,
  runQuery, saveAccount, saveEditedRow, saveNewRow, setActiveTab, setDensityMode, setLanguageMode, showAuthModal, showDatabaseInfo,
  showTableContent, showTableInfo, showTableQuery, showTableStructure, sqlValueLiteral;

authMode = 'login';
currentTableContentName = '';
currentTableContentColumns = [];
currentTablePKColumns = [];
rowSnapshots = {};
var currentLanguage = 'zh';
var languageMode = 'auto';
var densityMode = 'standard';
var defaultQuerySplitRatio = 0.52;
var querySplitRatio = defaultQuerySplitRatio;
var queryHistory = [];
var queryFavorites = [];
var queryHistoryRenderItems = [];
var maxQueryHistory = 20;
var indexEditTarget = null;
var i18nText = {
  zh: {
    page_title: 'SQLite 管理台',
    tab_structure: '表结构',
    tab_content: '表数据',
    tab_query: 'SQL 查询',
    current_user_label: '当前用户：',
    account_settings: '修改密码',
    logout: '退出登录',
    language_mode_label: '语言',
    language_mode_auto: '跟随系统',
    language_mode_zh: '中文',
    language_mode_en: 'English',
    density_mode_label: '密度',
    density_mode_standard: '标准',
    density_mode_compact: '紧凑',
    query_splitter_title: '拖拽调整查询区和结果区高度',
    query_empty_title: '结果区为空',
    query_empty_desc: '输入 SQL 后点击执行，结果会显示在这里',
    tables_list: '数据表列表',
    db_info: '数据库信息',
    filename: '文件名：',
    size: '大小：',
    table_count: '表数量：',
    index_count: '索引数量：',
    current_table_info: '当前表信息',
    rows_count: '行数：',
    create_table_sql: '建表 SQL',
    columns_info: '字段信息',
    column_name: '字段名',
    column_type: '类型',
    column_pk: '主键',
    column_not_null: '非空',
    column_default: '默认值',
    indexes_info: '索引信息',
    index_name: '索引名',
    index_columns: '字段',
    index_unique: '唯一',
    index_sql_title: '索引 SQL',
    index_tools_title: '索引操作',
    index_name_placeholder: '索引名',
    index_columns_placeholder: '字段，逗号分隔，例如 key, category',
    index_add: '新增索引',
    index_update: '保存索引',
    index_edit: '修改',
    index_delete: '删除',
    index_edit_hint_idle: '当前为新增模式',
    index_edit_hint_editing: '正在编辑索引：{{name}}',
    index_columns_required: '请填写索引字段。',
    index_name_required: '请填写索引名。',
    index_added: '索引已新增。',
    index_updated: '索引已更新。',
    index_deleted: '索引已删除。',
    index_confirm_delete: '确定删除索引 {{name}} 吗？',
    run_sql: '执行 SQL（Ctrl/Cmd+Enter）',
    run_sql_primary: '执行',
    export_csv: '导出 CSV',
    export_json: '导出 JSON',
    reset_query_layout: '重置布局',
    query_history_placeholder: '历史 SQL（选择回填）',
    query_shortcut_hint: '快捷执行：Ctrl/Cmd + Enter',
    favorite_query: '收藏当前 SQL',
    clear_query_history: '清空历史',
    query_stats_idle: '等待执行',
    query_stats_success: '耗时 {{ms}} ms · 返回 {{rows}} 行',
    query_stats_error: '执行失败（{{ms}} ms）',
    query_empty_current_sql: '当前 SQL 为空',
    query_favorite_added: '已收藏当前 SQL',
    query_favorite_exists: '当前 SQL 已收藏',
    query_history_cleared: '历史记录已清空',
    add_row: '新增一行',
    refresh_data: '刷新数据',
    login: '登录',
    username: '用户名',
    password: '密码',
    username_placeholder: '请输入用户名',
    password_placeholder: '请输入密码',
    new_username_optional: '新用户名',
    new_password_optional: '新密码',
    new_password_required: '新密码',
    new_password_label: '新密码',
    confirm_new_password: '确认新密码',
    current_password_required: '当前密码',
    current_password_label: '当前密码',
    leave_blank_if_unchanged: '不改可留空',
    confirm_password_placeholder: '仅修改密码时填写',
    current_password_placeholder: '用于确认身份',
    save_account_info: '修改密码',
    request_failed: '请求失败',
    auth_setup_title: '初始化管理员账号',
    auth_setup_notice: '首次使用请先创建管理员账号。',
    auth_setup_submit: '创建并登录',
    auth_login_title: '登录',
    auth_login_notice: '请输入账号密码登录。',
    auth_login_submit: '登录',
    get_auth_status_failed: '获取登录状态失败',
    require_current_password: '请填写当前密码。',
    require_new_password: '请填写新密码。',
    require_change_one_field: '请至少修改用户名或密码中的一项。',
    confirm_password_not_match: '两次输入的新密码不一致。',
    update_account_failed: '账号更新失败',
    account_updated: '账号信息已更新。',
    get_create_sql_failed: '获取建表 SQL 失败',
    get_table_schema_failed: '获取表结构失败',
    yes: '是',
    no: '否',
    view: '查看',
    get_indexes_failed: '获取索引失败',
    load_table_data_failed: '加载表数据失败',
    action: '操作',
    query_failed: '查询失败',
    load_tables_failed: '加载表失败',
    load_db_info_failed: '加载数据库信息失败',
    select_table_first: '请先选择一张表。',
    load_table_info_failed: '加载表信息失败',
    save_new_row: '保存新增',
    cancel: '取消',
    edit: '编辑',
    save: '保存',
    delete: '删除',
    no_pk_edit_delete: '无主键，无法编辑/删除',
    no_pk_safe_edit: '当前表没有主键，无法安全编辑。',
    update_failed: '更新失败',
    update_success: '更新成功。',
    no_target_table: '未选择目标表。',
    insert_failed: '新增失败',
    insert_success: '新增成功。',
    enter_table_content_first: '请先进入表数据页。',
    no_pk_delete: '当前表没有主键，无法删除。',
    confirm_delete_row: '确定删除该行吗？',
    delete_failed: '删除失败',
    delete_success: '删除成功。',
    username_password_required: '用户名和密码不能为空。',
    login_failed: '登录失败',
    schema_tools_title: '表结构修改',
    schema_add_column: '新增字段',
    schema_rename_column: '重命名字段',
    schema_drop_column: '删除字段',
    schema_rename_table: '重命名表',
    schema_column_name: '新字段名',
    schema_column_type: '类型，例如 TEXT / INTEGER',
    schema_default_optional: '默认值（可选）',
    schema_not_null: '非空',
    schema_primary_key: '主键',
    schema_auto_increment: '自增',
    schema_target_column: '新字段名',
    schema_new_table_name: '新表名',
    schema_select_column: '选择字段',
    schema_confirm_drop_column: '确定删除字段 {{name}} 吗？',
    schema_confirm_rename_table: '确定将表 {{from}} 重命名为 {{to}} 吗？',
    schema_invalid_name: '请填写合法名称。',
    schema_change_type: '改类型',
    schema_prompt_new_type: '请输入新的字段类型（例如 TEXT / INTEGER）：',
    schema_prompt_new_name: '请输入新的字段名：',
    schema_column_type_changed: '字段类型已修改。',
    schema_column_action_rename: '重命名',
    schema_column_action_drop: '删除',
    schema_inline_edit: '修改',
    schema_column_updated: '字段已修改。',
    schema_type_text: '文本 TEXT',
    schema_type_integer: '整数 INTEGER',
    schema_type_real: '浮点 REAL',
    schema_type_numeric: '数值 NUMERIC',
    schema_type_blob: '二进制 BLOB',
    schema_type_datetime: '日期时间 DATETIME',
    schema_type_date: '日期 DATE',
    schema_type_boolean: '布尔 BOOLEAN',
    schema_type_custom: '自定义',
    schema_custom_type_placeholder: '自定义类型',
    schema_create_table_name: '新表名',
    schema_create_columns_placeholder: '字段定义，例如：id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL',
    schema_create_table: '创建数据表',
    schema_create_columns_required: '请填写字段定义。',
    schema_create_preview_empty: '填写表名和字段定义后，这里会预览建表 SQL。',
    schema_create_preview_title: '即将创建：',
    schema_pk_exists: '当前表已存在主键，不能再新增主键字段。',
    schema_ai_requires_integer: '自增字段必须是 INTEGER 主键。',
    schema_sql_preview_empty: '等待结构操作...',
    schema_sql_preview_title: '即将执行 SQL：',
    schema_add_column_success: '字段已新增。',
    schema_rename_column_success: '字段已重命名。',
    schema_drop_column_success: '字段已删除。',
    schema_rename_table_success: '表已重命名。',
    schema_create_table_success: '数据表已创建。'
  },
  en: {
    page_title: 'SQLite Console',
    tab_structure: 'Structure',
    tab_content: 'Data',
    tab_query: 'SQL Query',
    current_user_label: 'Current User: ',
    account_settings: 'Change Password',
    logout: 'Logout',
    language_mode_label: 'Language',
    language_mode_auto: 'System',
    language_mode_zh: 'Chinese',
    language_mode_en: 'English',
    density_mode_label: 'Density',
    density_mode_standard: 'Standard',
    density_mode_compact: 'Compact',
    query_splitter_title: 'Drag to resize query/result panels',
    query_empty_title: 'No Results Yet',
    query_empty_desc: 'Run a SQL statement to display results here',
    tables_list: 'Tables',
    db_info: 'Database Info',
    filename: 'Filename: ',
    size: 'Size: ',
    table_count: 'Tables: ',
    index_count: 'Indexes: ',
    current_table_info: 'Current Table',
    rows_count: 'Rows: ',
    create_table_sql: 'CREATE TABLE SQL',
    columns_info: 'Columns',
    column_name: 'Name',
    column_type: 'Type',
    column_pk: 'Primary Key',
    column_not_null: 'Not Null',
    column_default: 'Default',
    indexes_info: 'Indexes',
    index_name: 'Name',
    index_columns: 'Columns',
    index_unique: 'Unique',
    index_sql_title: 'Index SQL',
    index_tools_title: 'Index Tools',
    index_name_placeholder: 'Index name',
    index_columns_placeholder: 'Columns, comma-separated, e.g. key, category',
    index_add: 'Add Index',
    index_update: 'Save Index',
    index_edit: 'Edit',
    index_delete: 'Delete',
    index_edit_hint_idle: 'Create mode',
    index_edit_hint_editing: 'Editing index: {{name}}',
    index_columns_required: 'Please provide index columns.',
    index_name_required: 'Please provide index name.',
    index_added: 'Index added.',
    index_updated: 'Index updated.',
    index_deleted: 'Index deleted.',
    index_confirm_delete: 'Delete index {{name}}?',
    run_sql: 'Run SQL (Ctrl/Cmd+Enter)',
    run_sql_primary: 'Run SQL Now',
    export_csv: 'Export CSV',
    export_json: 'Export JSON',
    reset_query_layout: 'Reset Layout',
    query_history_placeholder: 'SQL History (Select to Fill)',
    query_shortcut_hint: 'Shortcut: Ctrl/Cmd + Enter',
    favorite_query: 'Favorite Current SQL',
    clear_query_history: 'Clear History',
    query_stats_idle: 'Waiting to run',
    query_stats_success: '{{ms}} ms · {{rows}} rows',
    query_stats_error: 'Execution failed ({{ms}} ms)',
    query_empty_current_sql: 'Current SQL is empty',
    query_favorite_added: 'Current SQL has been favorited',
    query_favorite_exists: 'Current SQL is already favorited',
    query_history_cleared: 'History has been cleared',
    add_row: 'Add Row',
    refresh_data: 'Refresh',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    username_placeholder: 'Enter username',
    password_placeholder: 'Enter password',
    new_username_optional: 'New Username',
    new_password_optional: 'New Password',
    new_password_required: 'New Password',
    new_password_label: 'New Password',
    confirm_new_password: 'Confirm New Password',
    current_password_required: 'Current Password',
    current_password_label: 'Current Password',
    leave_blank_if_unchanged: 'Leave blank if unchanged',
    confirm_password_placeholder: 'Required when changing password',
    current_password_placeholder: 'Used to confirm identity',
    save_account_info: 'Change Password',
    request_failed: 'Request failed',
    auth_setup_title: 'Initialize Admin Account',
    auth_setup_notice: 'First use: create an admin account.',
    auth_setup_submit: 'Create and Login',
    auth_login_title: 'Login',
    auth_login_notice: 'Please login with username and password.',
    auth_login_submit: 'Login',
    get_auth_status_failed: 'Failed to get auth status',
    require_current_password: 'Please enter current password.',
    require_new_password: 'Please enter a new password.',
    require_change_one_field: 'Please change username or password.',
    confirm_password_not_match: 'New passwords do not match.',
    update_account_failed: 'Failed to update account',
    account_updated: 'Account updated.',
    get_create_sql_failed: 'Failed to get CREATE TABLE SQL',
    get_table_schema_failed: 'Failed to get table schema',
    yes: 'Yes',
    no: 'No',
    view: 'View',
    get_indexes_failed: 'Failed to get indexes',
    load_table_data_failed: 'Failed to load table data',
    action: 'Actions',
    query_failed: 'Query failed',
    load_tables_failed: 'Failed to load tables',
    load_db_info_failed: 'Failed to load database info',
    select_table_first: 'Please select a table first.',
    load_table_info_failed: 'Failed to load table info',
    save_new_row: 'Save New',
    cancel: 'Cancel',
    edit: 'Edit',
    save: 'Save',
    delete: 'Delete',
    no_pk_edit_delete: 'No primary key, edit/delete disabled',
    no_pk_safe_edit: 'No primary key in current table, cannot update safely.',
    update_failed: 'Update failed',
    update_success: 'Updated successfully.',
    no_target_table: 'No target table selected.',
    insert_failed: 'Insert failed',
    insert_success: 'Inserted successfully.',
    enter_table_content_first: 'Please open table data first.',
    no_pk_delete: 'No primary key in current table, delete disabled.',
    confirm_delete_row: 'Delete this row?',
    delete_failed: 'Delete failed',
    delete_success: 'Deleted successfully.',
    username_password_required: 'Username and password are required.',
    login_failed: 'Login failed',
    schema_tools_title: 'Schema Editor',
    schema_add_column: 'Add Column',
    schema_rename_column: 'Rename Column',
    schema_drop_column: 'Drop Column',
    schema_rename_table: 'Rename Table',
    schema_column_name: 'New column name',
    schema_column_type: 'Type, e.g. TEXT / INTEGER',
    schema_default_optional: 'Default value (optional)',
    schema_not_null: 'Not null',
    schema_primary_key: 'Primary Key',
    schema_auto_increment: 'Auto Increment',
    schema_target_column: 'New column name',
    schema_new_table_name: 'New table name',
    schema_select_column: 'Select column',
    schema_confirm_drop_column: 'Drop column {{name}}?',
    schema_confirm_rename_table: 'Rename table {{from}} to {{to}}?',
    schema_invalid_name: 'Please enter a valid name.',
    schema_change_type: 'Change Type',
    schema_prompt_new_type: 'Enter new column type (e.g. TEXT / INTEGER):',
    schema_prompt_new_name: 'Enter new column name:',
    schema_column_type_changed: 'Column type changed.',
    schema_column_action_rename: 'Rename',
    schema_column_action_drop: 'Delete',
    schema_inline_edit: 'Edit',
    schema_column_updated: 'Column updated.',
    schema_type_text: 'Text TEXT',
    schema_type_integer: 'Integer INTEGER',
    schema_type_real: 'Float REAL',
    schema_type_numeric: 'Numeric NUMERIC',
    schema_type_blob: 'Binary BLOB',
    schema_type_datetime: 'Datetime DATETIME',
    schema_type_date: 'Date DATE',
    schema_type_boolean: 'Boolean BOOLEAN',
    schema_type_custom: 'Custom',
    schema_custom_type_placeholder: 'Custom type',
    schema_create_table_name: 'New table name',
    schema_create_columns_placeholder: 'Column definitions, e.g. id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL',
    schema_create_table: 'Create Table',
    schema_create_columns_required: 'Please enter column definitions.',
    schema_create_preview_empty: 'Enter table name and column definitions to preview CREATE TABLE SQL here.',
    schema_create_preview_title: 'Will create:',
    schema_pk_exists: 'A primary key already exists on this table.',
    schema_ai_requires_integer: 'Autoincrement requires an INTEGER primary key.',
    schema_sql_preview_empty: 'Waiting for schema operations...',
    schema_sql_preview_title: 'SQL to execute:',
    schema_add_column_success: 'Column added.',
    schema_rename_column_success: 'Column renamed.',
    schema_drop_column_success: 'Column dropped.',
    schema_rename_table_success: 'Table renamed.',
    schema_create_table_success: 'Table created.'
  }
};

function getSystemLanguage() {
  return (window.navigator.language || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
}

function getEffectiveLanguage() {
  return languageMode === 'auto' ? getSystemLanguage() : languageMode;
}

function t(key) {
  var langPack = i18nText[currentLanguage] || i18nText.zh;
  return langPack[key] || i18nText.zh[key] || key;
}

function tf(key, values) {
  var text = t(key);
  if (!values) {
    return text;
  }
  return text.replace(/\{\{(\w+)\}\}/g, function(_, name) {
    return values[name] !== void 0 ? String(values[name]) : '';
  });
}

function refreshCurrentView() {
  if (!$('#main').is(':visible')) {
    return;
  }
  if ($('#table_structure').hasClass('selected')) {
    showTableStructure();
    return;
  }
  if ($('#table_content').hasClass('selected')) {
    showTableContent();
    return;
  }
  if ($('#table_query').hasClass('selected')) {
    showTableQuery();
  }
}

function applyI18n() {
  currentLanguage = getEffectiveLanguage();
  $('title').text(t('page_title'));
  $('html').attr('lang', currentLanguage === 'en' ? 'en' : 'zh-CN');
  $('meta[http-equiv="Content-Language"]').attr('content', currentLanguage === 'en' ? 'en' : 'zh-CN');

  $('[data-i18n]').each(function() {
    var key = $(this).attr('data-i18n');
    $(this).text(t(key));
  });

  $('[data-i18n-placeholder]').each(function() {
    var key = $(this).attr('data-i18n-placeholder');
    $(this).attr('placeholder', t(key));
  });

  $('#lang_mode option[value="auto"]').text(t('language_mode_auto'));
  $('#lang_mode option[value="zh"]').text(t('language_mode_zh'));
  $('#lang_mode option[value="en"]').text(t('language_mode_en'));
  $('#lang_mode').val(languageMode);

  $('#density_mode option[value="standard"]').text(t('density_mode_standard'));
  $('#density_mode option[value="compact"]').text(t('density_mode_compact'));
  $('#density_mode').val(densityMode);
  $('#query_splitter').attr('title', t('query_splitter_title'));
  $('#query_shortcut_hint').text(t('query_shortcut_hint'));
  if (!$('#query_result_stats').attr('data-runtime')) {
    $('#query_result_stats').text(t('query_stats_idle'));
  }

  $('#result_empty .title').text(t('query_empty_title'));
  $('#result_empty .desc').text(t('query_empty_desc'));
  $('#schema_tools [data-i18n="schema_auto_increment"]').text(t('schema_auto_increment'));
  if (!$('#schema_sql_preview').attr('data-runtime')) {
    $('#schema_sql_preview').text(t('schema_sql_preview_empty'));
  }
  $('#index_save_btn').text(indexEditTarget ? t('index_update') : t('index_add'));
  $('#index_edit_hint').text(indexEditTarget ? tf('index_edit_hint_editing', { name: indexEditTarget.name }) : t('index_edit_hint_idle'));
  renderQueryHistory();
  populateSchemaColumnSelectors();

  if (authMode === 'setup') {
    $('#auth_title').text(t('auth_setup_title'));
    $('#auth_notice').text(t('auth_setup_notice'));
    $('#btn_auth_submit').text(t('auth_setup_submit'));
  } else {
    $('#auth_title').text(t('auth_login_title'));
    $('#auth_notice').text(t('auth_login_notice'));
    $('#btn_auth_submit').text(t('auth_login_submit'));
  }
}

setLanguageMode = function(mode, rerender) {
  languageMode = (mode === 'zh' || mode === 'en') ? mode : 'auto';
  window.localStorage.setItem('gobroem_lang_mode', languageMode);

  // Keep backward compatibility for existing stored key.
  if (languageMode === 'auto') {
    window.localStorage.removeItem('gobroem_lang');
  } else {
    window.localStorage.setItem('gobroem_lang', languageMode);
  }

  applyI18n();
  if (rerender) {
    refreshCurrentView();
  }
};

setDensityMode = function(mode) {
  densityMode = mode === 'compact' ? 'compact' : 'standard';
  window.localStorage.setItem('gobroem_density_mode', densityMode);
  $('#density_mode').val(densityMode);
  $('body').toggleClass('compact-mode', densityMode === 'compact');
};

function applyQuerySplitLayout() {
  if (!$('#content').hasClass('query-mode')) {
    return;
  }

  if (window.innerWidth <= 980) {
    $('#input, #output').css('height', '');
    if (editorInstance) {
      editorInstance.resize();
    }
    return;
  }

  var workspace = $('#query_workspace');
  var splitter = $('#query_splitter');
  var workspaceHeight = workspace.height();
  var splitterHeight = splitter.outerHeight() || 10;
  var available = workspaceHeight - splitterHeight;

  if (available < 360) {
    return;
  }

  var inputHeight = Math.round(available * querySplitRatio);
  inputHeight = Math.max(180, Math.min(inputHeight, available - 160));
  var outputHeight = available - inputHeight;

  $('#input').css('height', inputHeight + 'px');
  $('#output').css('height', outputHeight + 'px');

  if (editorInstance) {
    editorInstance.resize();
  }
}

function saveQuerySplitRatio() {
  window.localStorage.setItem('gobroem_query_split_ratio', String(querySplitRatio));
}

function loadQuerySplitRatio() {
  var raw = window.localStorage.getItem('gobroem_query_split_ratio');
  if (!raw) {
    querySplitRatio = defaultQuerySplitRatio;
    return;
  }

  var parsed = parseFloat(raw);
  if (isNaN(parsed)) {
    querySplitRatio = defaultQuerySplitRatio;
    return;
  }

  querySplitRatio = Math.max(0.2, Math.min(parsed, 0.8));
}

function loadQueryFavorites() {
  var raw = window.localStorage.getItem('gobroem_query_favorites');
  if (!raw) {
    queryFavorites = [];
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    if ($.isArray(parsed)) {
      queryFavorites = parsed.filter(function(item) {
        return typeof item === 'string' && $.trim(item).length > 0;
      });
    } else {
      queryFavorites = [];
    }
  } catch (e) {
    queryFavorites = [];
  }
}

function saveQueryFavorites() {
  window.localStorage.setItem('gobroem_query_favorites', JSON.stringify(queryFavorites));
}

loadQueryHistory = function() {
  var raw = window.localStorage.getItem('gobroem_query_history');
  if (!raw) {
    queryHistory = [];
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    if ($.isArray(parsed)) {
      queryHistory = parsed.filter(function(item) {
        return typeof item === 'string' && $.trim(item).length > 0;
      }).slice(0, maxQueryHistory);
    } else {
      queryHistory = [];
    }
  } catch (e) {
    queryHistory = [];
  }
};

renderQueryHistory = function() {
  var $history = $('#query_history');
  if (!$history.length) {
    return;
  }

  $history.empty();
  queryHistoryRenderItems = [];
  $('<option></option>')
    .attr('value', '')
    .text(t('query_history_placeholder'))
    .appendTo($history);

  var ordered = [];
  queryFavorites.forEach(function(fav) {
    ordered.push({ sql: fav, favorite: true });
  });
  queryHistory.forEach(function(sql) {
    if (queryFavorites.indexOf(sql) === -1) {
      ordered.push({ sql: sql, favorite: false });
    }
  });

  ordered.forEach(function(item, idx) {
    var sql = item.sql;
    var label = sql.replace(/\s+/g, ' ').trim();
    if (label.length > 100) {
      label = label.slice(0, 100) + '...';
    }

    queryHistoryRenderItems.push(item);
    $('<option></option>')
      .attr('value', idx)
      .text((item.favorite ? '★ ' : '') + (idx + 1) + '. ' + label)
      .appendTo($history);
  });

  $history.val('');
};

pushQueryHistory = function(query) {
  var normalized = $.trim(query);
  if (!normalized) {
    return;
  }

  queryHistory = queryHistory.filter(function(item) {
    return item !== normalized;
  });
  queryHistory.unshift(normalized);
  if (queryHistory.length > maxQueryHistory) {
    queryHistory = queryHistory.slice(0, maxQueryHistory);
  }

  window.localStorage.setItem('gobroem_query_history', JSON.stringify(queryHistory));
  renderQueryHistory();
};

populateSchemaColumnSelectors = function(schemaRows) {
  var names = [];
  var selected = $('#tables li.selected').text();
  $('#schema_current_table').text(selected || '-');

  if ($.isArray(schemaRows)) {
    names = schemaRows.map(function(col) { return col.name; });
  } else {
    $('#table_columns tbody tr').each(function() {
      names.push($.trim($(this).find('th').first().text()));
    });
  }

  var $rename = $('#schema_rename_from');
  var $drop = $('#schema_drop_column_name');
  if (!$rename.length || !$drop.length) {
    return;
  }

  $rename.empty();
  $drop.empty();
  $('<option></option>').attr('value', '').text(t('schema_select_column')).appendTo($rename);
  $('<option></option>').attr('value', '').text(t('schema_select_column')).appendTo($drop);

  names.forEach(function(name) {
    $('<option></option>').attr('value', name).text(name).appendTo($rename);
    $('<option></option>').attr('value', name).text(name).appendTo($drop);
  });
};

applySchemaChange = function(sql, successKey, preferredTable, onSuccess) {
  setSchemaSqlPreview([sql]);
  executeQuery(sql, function(data) {
    if (data.code === 'error') {
      alert(data.message || t('query_failed'));
      return;
    }

    if (typeof onSuccess === 'function') {
      onSuccess();
    }

    alert(t(successKey));
    loadTables(function() {}, preferredTable || $('#tables li.selected').text());
  });
};

function setQueryStatsIdle() {
  $('#query_result_stats').removeAttr('data-runtime').text(t('query_stats_idle'));
}

function setQueryStatsSuccess(ms, rows) {
  var msg = tf('query_stats_success', { ms: ms, rows: rows });
  $('#query_result_stats').attr('data-runtime', '1').text(msg);
}

function setQueryStatsError(ms) {
  var msg = tf('query_stats_error', { ms: ms });
  $('#query_result_stats').attr('data-runtime', '1').text(msg);
}

function ensureQueryActionButtonsEnabled() {
  $('#run, #export_csv, #export_json').prop('disabled', false).removeAttr('disabled');
}

function parseIndexColumns(raw) {
  var values = $.isArray(raw) ? raw : String(raw || '').split(',');
  return values.map(function(item) {
    return $.trim(item);
  }).filter(function(item) {
    return item.length > 0;
  });
}

function populateIndexColumnSelector(schemaRows) {
  var names = [];
  var selected;
  var $columns = $('#index_columns_input');

  if (!$columns.length) {
    return;
  }

  selected = parseIndexColumns($columns.val());

  if ($.isArray(schemaRows)) {
    names = schemaRows.map(function(col) { return col.name; });
  } else {
    $('#table_columns tbody tr').each(function() {
      names.push($.trim($(this).find('th').first().text()));
    });
  }

  $columns.empty();
  names.forEach(function(name) {
    $('<option></option>').attr('value', name).text(name).appendTo($columns);
  });

  $columns.val(selected.filter(function(name) {
    return names.indexOf(name) >= 0;
  }));
}

function buildCreateIndexSQL(tableName, indexName, columns, unique) {
  var uniq = unique ? 'UNIQUE ' : '';
  var cols = columns.map(function(col) { return escapeIdentifier(col); }).join(', ');
  return 'CREATE ' + uniq + 'INDEX ' + escapeIdentifier(indexName) + ' ON ' + escapeIdentifier(tableName) + ' (' + cols + ');';
}

function resetIndexTools() {
  indexEditTarget = null;
  $('#index_name_input').val('');
  $('#index_columns_input').val([]);
  $('#index_unique_input').prop('checked', false);
  $('#index_cancel_edit_btn').hide();
  $('#index_save_btn').text(t('index_add'));
  $('#index_edit_hint').text(t('index_edit_hint_idle'));
}

function startIndexEdit(target) {
  indexEditTarget = target;
  $('#index_name_input').val(target.name || '');
  $('#index_columns_input').val(parseIndexColumns(target.columns || []));
  $('#index_unique_input').prop('checked', !!target.unique);
  $('#index_cancel_edit_btn').show();
  $('#index_save_btn').text(t('index_update'));
  $('#index_edit_hint').text(tf('index_edit_hint_editing', { name: target.name || '' }));
}

function setSchemaSqlPreview(sqls) {
  if (!sqls || !sqls.length) {
    $('#schema_sql_preview').removeAttr('data-runtime').text(t('schema_sql_preview_empty'));
    return;
  }
  $('#schema_sql_preview').attr('data-runtime', '1').text(t('schema_sql_preview_title') + '\n' + sqls.join('\n'));
}

function executeSqlSeries(sqls, done) {
  setSchemaSqlPreview(sqls);
  var idx = 0;
  function next() {
    if (idx >= sqls.length) {
      done(null);
      return;
    }
    executeQuery(sqls[idx], function(data) {
      if (data.code === 'error') {
        done(data.message || t('query_failed'));
        return;
      }
      idx += 1;
      next();
    });
  }
  next();
}

function schemaDefaultExpr(rawInput) {
  var raw = $.trim(rawInput == null ? '' : String(rawInput));
  var upper = raw.toUpperCase();
  if (!raw) {
    return null;
  }
  if (upper === 'NULL' || upper === 'CURRENT_TIMESTAMP' || upper === 'CURRENT_DATE' || upper === 'CURRENT_TIME') {
    return upper;
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return raw;
  }
  if ((raw[0] === "'" && raw[raw.length - 1] === "'") || (raw[0] === '"' && raw[raw.length - 1] === '"')) {
    return raw;
  }
  return sqlValueLiteral(raw);
}

function getSchemaTypeValue(selectValue, customValue) {
  var picked = $.trim(selectValue || '');
  if (picked === '__custom__') {
    return $.trim(customValue || '');
  }
  return picked;
}

function toggleSchemaTypeCustom($select, $custom) {
  if (!$select.length || !$custom.length) {
    return;
  }
  if ($select.val() === '__custom__') {
    $custom.show();
  } else {
    $custom.hide();
  }
}

function buildSchemaTypeSelectHtml(selectedType, selectClass, customClass) {
  var normalized = $.trim(selectedType || '').toUpperCase();
  var common = ['TEXT', 'INTEGER', 'REAL', 'NUMERIC', 'BLOB', 'DATETIME', 'DATE', 'BOOLEAN'];
  var isCommon = common.indexOf(normalized) >= 0;
  var current = isCommon ? normalized : '__custom__';
  var customVal = isCommon ? '' : _.escape(selectedType || '');

  var html = '';
  html += '<select class="form-control input-sm ' + selectClass + '">';
  html += '<option value="TEXT"' + (current === 'TEXT' ? ' selected' : '') + '>' + t('schema_type_text') + '</option>';
  html += '<option value="INTEGER"' + (current === 'INTEGER' ? ' selected' : '') + '>' + t('schema_type_integer') + '</option>';
  html += '<option value="REAL"' + (current === 'REAL' ? ' selected' : '') + '>' + t('schema_type_real') + '</option>';
  html += '<option value="NUMERIC"' + (current === 'NUMERIC' ? ' selected' : '') + '>' + t('schema_type_numeric') + '</option>';
  html += '<option value="BLOB"' + (current === 'BLOB' ? ' selected' : '') + '>' + t('schema_type_blob') + '</option>';
  html += '<option value="DATETIME"' + (current === 'DATETIME' ? ' selected' : '') + '>' + t('schema_type_datetime') + '</option>';
  html += '<option value="DATE"' + (current === 'DATE' ? ' selected' : '') + '>' + t('schema_type_date') + '</option>';
  html += '<option value="BOOLEAN"' + (current === 'BOOLEAN' ? ' selected' : '') + '>' + t('schema_type_boolean') + '</option>';
  html += '<option value="__custom__"' + (current === '__custom__' ? ' selected' : '') + '>' + t('schema_type_custom') + '</option>';
  html += '</select>';
  html += '<input type="text" class="form-control input-sm ' + customClass + '" style="margin-top:4px;' + (current === '__custom__' ? '' : 'display:none;') + '" value="' + customVal + '" placeholder="' + _.escape(t('schema_custom_type_placeholder')) + '">';
  return html;
}

function buildColumnDefinition(col, overrides) {
  var meta = $.extend({}, col, overrides || {});
  var def = escapeIdentifier(meta.name) + ' ' + (meta.type || 'TEXT');
  if (meta.pk) {
    def += ' PRIMARY KEY';
  }
  if (meta.autoincrement) {
    def += ' AUTOINCREMENT';
  }
  if (meta.notnull) {
    def += ' NOT NULL';
  }
  if (meta.defaultExpr !== null && meta.defaultExpr !== void 0 && meta.defaultExpr !== '') {
    def += ' DEFAULT ' + meta.defaultExpr;
  }
  return def;
}

function rebuildTableForColumnUpdate(tableName, sourceColName, targetMeta, successKey) {
  getTable(tableName, function(schemaRows) {
    if (schemaRows.code === 'error') {
      alert(schemaRows.message || t('get_table_schema_failed'));
      return;
    }

    var tempTable = tableName + '__tmp_' + Date.now();
    var defs = [];
    var oldCols = [];
    var selectExprs = [];

    schemaRows.forEach(function(col) {
      if (col.name === sourceColName) {
        defs.push(buildColumnDefinition(col, {
          name: targetMeta.name,
          type: targetMeta.type,
          notnull: targetMeta.notnull,
          defaultExpr: targetMeta.defaultExpr
        }));
        oldCols.push(escapeIdentifier(col.name));
        selectExprs.push(escapeIdentifier(col.name));
      } else {
        defs.push(buildColumnDefinition(col, {
          defaultExpr: col.dflt_value
        }));
        oldCols.push(escapeIdentifier(col.name));
        selectExprs.push(escapeIdentifier(col.name));
      }
    });

    var newCols = schemaRows.map(function(col) {
      return escapeIdentifier(col.name === sourceColName ? targetMeta.name : col.name);
    });

    var sqls = [
      'CREATE TABLE ' + escapeIdentifier(tempTable) + ' (' + defs.join(', ') + ');',
      'INSERT INTO ' + escapeIdentifier(tempTable) + ' (' + newCols.join(', ') + ') SELECT ' + selectExprs.join(', ') + ' FROM ' + escapeIdentifier(tableName) + ';',
      'DROP TABLE ' + escapeIdentifier(tableName) + ';',
      'ALTER TABLE ' + escapeIdentifier(tempTable) + ' RENAME TO ' + escapeIdentifier(tableName) + ';'
    ];

    executeSqlSeries(sqls, function(errMsg) {
      if (errMsg) {
        alert(errMsg);
        return;
      }
      alert(t(successKey));
      loadTables(function() {}, tableName);
    });
  });
}

function rebuildTableForAddColumn(tableName, payload) {
  getTable(tableName, function(schemaRows) {
    if (schemaRows.code === 'error') {
      alert(schemaRows.message || t('get_table_schema_failed'));
      return;
    }

    var hasPK = schemaRows.some(function(col) { return !!col.pk; });
    if (payload.pk && hasPK) {
      alert(t('schema_pk_exists'));
      return;
    }
    if (payload.autoincrement && (!payload.pk || String(payload.type).toUpperCase() !== 'INTEGER')) {
      alert(t('schema_ai_requires_integer'));
      return;
    }

    var tempTable = tableName + '__tmp_' + Date.now();
    var defs = schemaRows.map(function(col) {
      return buildColumnDefinition(col, { defaultExpr: col.dflt_value });
    });
    defs.push(buildColumnDefinition({
      name: payload.name,
      type: payload.type,
      pk: payload.pk,
      autoincrement: payload.autoincrement,
      notnull: payload.notnull,
      defaultExpr: payload.defaultExpr
    }));

    var oldCols = schemaRows.map(function(col) { return escapeIdentifier(col.name); });
    var newCols = oldCols.slice();
    newCols.push(escapeIdentifier(payload.name));
    var selectExprs = oldCols.slice();
    selectExprs.push(payload.defaultExpr || 'NULL');

    var sqls = [
      'CREATE TABLE ' + escapeIdentifier(tempTable) + ' (' + defs.join(', ') + ');',
      'INSERT INTO ' + escapeIdentifier(tempTable) + ' (' + newCols.join(', ') + ') SELECT ' + selectExprs.join(', ') + ' FROM ' + escapeIdentifier(tableName) + ';',
      'DROP TABLE ' + escapeIdentifier(tableName) + ';',
      'ALTER TABLE ' + escapeIdentifier(tempTable) + ' RENAME TO ' + escapeIdentifier(tableName) + ';'
    ];

    executeSqlSeries(sqls, function(errMsg) {
      if (errMsg) {
        alert(errMsg);
        return;
      }
      alert(t('schema_add_column_success'));
      loadTables(function() {}, tableName);
    });
  });
}

rebuildTableForColumnType = function(tableName, columnName, newType) {
  rebuildTableForColumnUpdate(tableName, columnName, {
    name: columnName,
    type: newType,
    notnull: false,
    defaultExpr: null
  }, 'schema_column_type_changed');
};

apiCall = function(method, path, params, cb) {
  return $.ajax({
    url: apiRoot + path,
    type: method,
    data: params,
    cache: false,
    error: function(xhr) {
      var body;
      body = {
        code: 'error',
        message: t('request_failed')
      };
      if (xhr && xhr.responseText) {
        try {
          body = $.parseJSON(xhr.responseText);
        } catch (e) {
          body.message = xhr.responseText;
        }
      }
      return cb(body);
    },
    success: function(data) {
      return cb(data);
    }
  });
};

escapeIdentifier = function(name) {
  var safe;
  safe = (name == null ? '' : String(name)).replace(/"/g, '""');
  return '"' + safe + '"';
};

escapeSQLString = function(value) {
  return String(value).replace(/'/g, "''");
};

isNumericString = function(value) {
  return /^-?\d+(\.\d+)?$/.test(value);
};

sqlValueLiteral = function(valueText) {
  var raw, upper;
  raw = valueText == null ? '' : String(valueText);
  upper = $.trim(raw).toUpperCase();

  if (upper === 'NULL') {
    return 'NULL';
  }
  if (upper === 'TRUE') {
    return '1';
  }
  if (upper === 'FALSE') {
    return '0';
  }
  if ($.trim(raw) !== '' && isNumericString($.trim(raw))) {
    return $.trim(raw);
  }
  return "'" + escapeSQLString(raw) + "'";
};

formatCellValue = function(value) {
  if (value === null || value === void 0) {
    return 'NULL';
  }
  return String(value);
};

getInfo = function(cb) {
  return apiCall('GET', 'api/info', {}, cb);
};

getTables = function(cb) {
  return apiCall('GET', 'api/tables', {}, cb);
};

getTableInfo = function(table, cb) {
  return apiCall('GET', 'api/table/info', { table: table }, cb);
};

getTable = function(table, cb) {
  return apiCall('GET', 'api/table', { table: table }, cb);
};

getTableSql = function(table, cb) {
  return apiCall('GET', 'api/table/sql', { table: table }, cb);
};

getTableIndexes = function(table, cb) {
  return apiCall('GET', 'api/table/indexes', { table: table }, cb);
};

getTableContent = function(table, cb) {
  var rowIdAlias = '__gobroem_rowid__';
  return executeQuery('SELECT rowid AS ' + escapeIdentifier(rowIdAlias) + ', * FROM ' + escapeIdentifier(table) + ';', function(data) {
    if (data && data.code === 'error') {
      return executeQuery('SELECT * FROM ' + escapeIdentifier(table) + ';', cb);
    }
    return cb(data);
  });
};

getQuery = function(query, cb) {
  return executeQuery(query, cb);
};

executeQuery = function(query, cb) {
  return apiCall('POST', 'api/query', { query: query }, cb);
};

showAuthModal = function(configured) {
  authMode = configured ? 'login' : 'setup';
  if (authMode === 'setup') {
    $('#auth_title').text(t('auth_setup_title'));
    $('#auth_notice').text(t('auth_setup_notice'));
    $('#btn_auth_submit').text(t('auth_setup_submit'));
  } else {
    $('#auth_title').text(t('auth_login_title'));
    $('#auth_notice').text(t('auth_login_notice'));
    $('#btn_auth_submit').text(t('auth_login_submit'));
  }

  $('#auth_password').val('');
  $('#auth_modal').modal('show');
};

initAuthFlow = function(cb) {
  return apiCall('GET', 'api/auth/status', {}, function(data) {
    if (data.code === 'error') {
      alert(data.message || t('get_auth_status_failed'));
      return;
    }

    if (!data.configured || !data.authenticated) {
      $('#main').hide();
      showAuthModal(data.configured);
      return;
    }

    $('#current_username').text(data.username || '-');
    $('#auth_modal').modal('hide');
    cb();
  });
};

saveAccount = function() {
  var currentPassword, newPassword, confirmPassword;
  newPassword = $('#new_password').val();
  confirmPassword = $('#confirm_password').val();
  currentPassword = $('#current_password').val();

  if (!currentPassword) {
    alert(t('require_current_password'));
    return;
  }
  if (!newPassword) {
    alert(t('require_new_password'));
    return;
  }
  if (newPassword !== confirmPassword) {
    alert(t('confirm_password_not_match'));
    return;
  }

  apiCall('POST', 'api/auth/update', {
    new_password: newPassword,
    current_password: currentPassword
  }, function(data) {
    if (data.code === 'error') {
      alert(data.message || t('update_account_failed'));
      return;
    }
    $('#current_username').text(data.username || $('#current_username').text());
    $('#account_modal').modal('hide');
    $('#new_password').val('');
    $('#confirm_password').val('');
    $('#current_password').val('');
    alert(t('account_updated'));
  });
};

buildTableStructure = function(name, cb) {
  return getTableSql(name, function(data) {
    if (data.code === 'error') {
      alert(data.message || t('get_create_sql_failed'));
      return cb();
    }

    $('#structure_sql').text(data.sql || '');
    return getTable(name, function(columns) {
      var items = columns;
      if (columns.code === 'error') {
        alert(columns.message || t('get_table_schema_failed'));
        return cb();
      }

      $('#table_columns tbody').empty();
      items.forEach(function(item) {
        var column, defVal;
        defVal = item.dflt_value === null ? 'NULL' : item.dflt_value;
        column = '<tr data-col-name="' + _.escape(item.name) + '" data-col-type="' + _.escape(item.type || '') + '" data-col-notnull="' + (item.notnull ? '1' : '0') + '" data-col-default="' + _.escape(item.dflt_value === null ? '' : String(item.dflt_value)) + '" data-col-pk="' + (item.pk ? '1' : '0') + '">';
        column += '<th data-column-name="' + _.escape(item.name) + '">' + item.name + '</th>';
        column += '<th>' + item.type + '</th>';
        column += '<th>' + (item.pk ? t('yes') : t('no')) + '</th>';
        column += '<th>' + (item.notnull ? t('yes') : t('no')) + '</th>';
        column += '<th>' + defVal + '</th>';
        column += '<th><div class="schema-col-actions">';
        column += '<button class="btn btn-default btn-xs schema-col-edit" type="button">' + t('schema_inline_edit') + '</button>';
        column += '<button class="btn btn-primary btn-xs schema-col-save" type="button" style="display:none;">' + t('save') + '</button>';
        column += '<button class="btn btn-link btn-xs schema-col-cancel" type="button" style="display:none;">' + t('cancel') + '</button>';
        column += '<button class="btn btn-danger btn-xs schema-col-drop" type="button">' + t('schema_column_action_drop') + '</button>';
        column += '</div></th>';
        column += '</tr>';
        $('#table_columns tbody').append(column);
      });
      populateSchemaColumnSelectors(items);
      populateIndexColumnSelector(items);

      return getTableIndexes(name, function(indexes) {
        $('#table_indexes tbody').empty();
        resetIndexTools();
        if (indexes && indexes.code === 'error') {
          alert(indexes.message || t('get_indexes_failed'));
          return cb();
        }
        if ((indexes == null) || indexes.length < 1) {
          return cb();
        }
        indexes.forEach(function(item) {
          var cols, column, pre, sqlLink, unique, actions;
          if (!item.sql) {
            item.sql = '';
          }
          cols = getColumnsFromIndexSql(item.tbl_name, item.sql);
          column = '<tr data-index-name="' + _.escape(item.name) + '" data-index-table="' + _.escape(item.tbl_name || name) + '" data-index-columns="' + _.escape(cols.join(',')) + '" data-index-unique="' + (item.sql.indexOf('UNIQUE') > -1 ? '1' : '0') + '" data-index-editable="' + (item.sql ? '1' : '0') + '">';
          column += '<th>' + item.name + '</th>';
          column += '<th>' + cols.join(', ') + '</th>';
          unique = item.sql.indexOf('UNIQUE') > -1 ? t('yes') : t('no');
          column += '<th>' + unique + '</th>';
          sqlLink = '<a class="view-sql" data-toggle="modal" data-target="#index_sql_modal" data-name="' + item.name + '" href="#">' + t('view') + '</a>';
          pre = '<pre style="display: none;">' + item.sql + '</pre>';
          column += '<th>' + sqlLink + pre + '</th>';
          actions = '';
          if (item.sql) {
            actions += '<button class="btn btn-default btn-xs index-edit" type="button">' + t('index_edit') + '</button> ';
            actions += '<button class="btn btn-danger btn-xs index-delete" type="button">' + t('index_delete') + '</button>';
          }
          column += '<th>' + actions + '</th>';
          column += '</tr>';
          $('#table_indexes tbody').append(column);
        });
        return cb();
      });
    });
  });
};

buildTableContent = function(name, cb) {
  return getTable(name, function(schemaRows) {
    if (schemaRows.code === 'error') {
      alert(schemaRows.message || t('get_table_schema_failed'));
      return cb();
    }

    currentTableContentName = name;
    currentTableContentColumns = [];
    currentTablePKColumns = [];
    rowSnapshots = {};

    schemaRows.forEach(function(col) {
      currentTableContentColumns.push(col.name);
      if (col.pk) {
        currentTablePKColumns.push(col.name);
      }
    });

      populateSchemaColumnSelectors(schemaRows);

    return getTableContent(name, function(data) {
      var headers, rows, hasRowId, rowIdAlias;
      if (data && data.code === 'error') {
        alert(data.message || t('load_table_data_failed'));
        return cb();
      }

      rowIdAlias = '__gobroem_rowid__';
      hasRowId = $.isArray(data.columns) && data.columns.length > 0 && data.columns[0] === rowIdAlias;

      resetResultTable();
      $('#result_empty').hide();
      headers = (hasRowId ? data.columns.slice(1) : data.columns).map(function(colName) {
        return buildResultHeader(colName);
      });
      headers.push('<th>' + t('action') + '</th>');
      addHeadersToResultTable(headers);

      rows = data.rows.map(function(row, rowIndex) {
        var snapshot = {
          rowid: hasRowId ? row[0] : null,
          values: hasRowId ? row.slice(1) : row.slice()
        };
        rowSnapshots[rowIndex] = snapshot;
        return buildResultRow(snapshot.values, rowIndex, false);
      });
      addRowsToResultTable(rows);
      return cb();
    });
  });
};

buildTableQueryResult = function(query, startedAt) {
  return getQuery(query, function(data) {
    var headers, rows;
    var elapsed = Math.max(0, Date.now() - startedAt);
    ensureQueryActionButtonsEnabled();
    if (data.code === 'error') {
      setQueryStatsError(elapsed);
      alert(data.message || t('query_failed'));
      return;
    }

    resetResultTable();
    $('#result_empty').hide();
    headers = data.columns.map(function(colName) {
      return buildResultHeader(colName);
    });
    addHeadersToResultTable(headers);

    rows = data.rows.map(function(row) {
      return buildResultRow(row);
    });
    addRowsToResultTable(rows);
    setQueryStatsSuccess(elapsed, data.rows ? data.rows.length : 0);
  });
};

loadTables = function(cb, preferredTable) {
  $('#tables').empty();
  return getTables(function(data) {
    var $preferred, table;
    if (data.code === 'error') {
      alert(data.message || t('load_tables_failed'));
      return cb();
    }

    data.tables.forEach(function(item) {
      $('<li><span>' + item + '</span></li>').appendTo('#tables');
    });

    if (data.tables.length > 0) {
      $('#tables li.selected').removeClass('selected');
      if (preferredTable) {
        $preferred = $('#tables li').filter(function() {
          return $.trim($(this).text()) === preferredTable;
        }).first();
      }
      table = ($preferred && $preferred.length) ? $preferred : $('#tables li:first');
      $(table).addClass('selected');
      showTableInfo();
      showTableStructure();
    }
    cb();
  });
};

showDatabaseInfo = function() {
  return getInfo(function(data) {
    if (data.code === 'error') {
      alert(data.message || t('load_db_info_failed'));
      return;
    }
    $('#db_file_name').text(data.filename);
    $('#db_size').text(bytesToSize(data.size));
    $('#db_count_tables').text(data.number_of_tables);
    $('#db_count_indexes').text(data.number_of_indexes);
  });
};

showTableInfo = function() {
  var name = $('#tables li.selected').text();
  if (name.length === 0) {
    alert(t('select_table_first'));
    return;
  }

  return getTableInfo(name, function(data) {
    if (data.code === 'error') {
      alert(data.message || t('load_table_info_failed'));
      return;
    }
    $('#table_information').show();
    $('#table_count_rows').text(data.row_count);
  });
};

showTableStructure = function() {
  var name = $('#tables li.selected').text();
  if (name.length === 0) {
    alert(t('select_table_first'));
    return;
  }

  return buildTableStructure(name, function() {
    setActiveTab('table_structure');
    $('#content').removeClass('query-mode');
    $('#structure').show();
    $('#query_workspace').hide();
    $('#input, #output').css('height', '');
    $('.table-actions').hide();
  });
};

showTableContent = function() {
  var name = $('#tables li.selected').text();
  if (name.length === 0) {
    alert(t('select_table_first'));
    return;
  }

  return buildTableContent(name, function() {
    setActiveTab('table_content');
    $('#content').removeClass('query-mode');
    $('#structure').hide();
    $('#query_workspace').show();
    $('#input').hide();
    $('#query_splitter').hide();
    $('#input, #output').css('height', '');
    $('#output').addClass('full');
    $('#output').show();
    $('.table-actions').show();
  });
};

showTableQuery = function() {
  resetResultTable();
  $('#result_empty').show();
  setQueryStatsIdle();
  ensureQueryActionButtonsEnabled();
  setActiveTab('table_query');
  $('#content').addClass('query-mode');
  $('#structure').hide();
  $('#query_workspace').show();
  $('#output').removeClass('full');
  $('#input').show();
  $('#query_splitter').show();
  $('#output').show();
  $('.table-actions').hide();
  setTimeout(applyQuerySplitLayout, 0);
};

runQuery = function(query) {
  var startedAt = Date.now();
  pushQueryHistory(query);
  buildTableQueryResult(query, startedAt);
};

exportCSV = function(query) {
  var url = apiRoot + 'api/query?format=csv&query=' + window.encodeURIComponent(query.replace(/\n/g, ' '));
  window.open(url, '_blank');
};

exportJSON = function(query) {
  var url = apiRoot + 'api/query?format=json&query=' + window.encodeURIComponent(query.replace(/\n/g, ' '));
  window.open(url, '_blank');
};

buildResultHeader = function(name) {
  return '<th>' + name + '</th>';
};

addHeadersToResultTable = function(headers) {
  var header = '<thead><tr>';
  headers.forEach(function(h) {
    header += h;
  });
  header += '</tr></thead>';
  $('#table_results').append(header);
};

buildResultRow = function(row, rowIndex, isNew) {
  var result = '<tr';
  if (rowIndex !== void 0) {
    result += ' data-row-index="' + rowIndex + '"';
  }
  if (isNew) {
    result += ' data-new-row="1"';
  }
  result += '>';

  row.forEach(function(v, colIdx) {
    var value = formatCellValue(v);
    var editable = isNew ? 'true' : 'false';
    result += '<td class="data-cell" data-col-index="' + colIdx + '" contenteditable="' + editable + '">' + _.escape(value) + '</td>';
  });

  if (rowIndex !== void 0 || isNew) {
    var actions = '<td class="row-actions">';
    if (isNew) {
      actions += '<button class="btn btn-xs btn-primary row-save-new" type="button">' + t('save_new_row') + '</button> ';
      actions += '<button class="btn btn-xs btn-link row-cancel-new" type="button">' + t('cancel') + '</button>';
    } else {
      actions += '<button class="btn btn-xs btn-default row-edit" type="button">' + t('edit') + '</button> ';
      actions += '<button class="btn btn-xs btn-primary row-save" type="button" style="display:none;">' + t('save') + '</button> ';
      actions += '<button class="btn btn-xs btn-link row-cancel" type="button" style="display:none;">' + t('cancel') + '</button> ';
      actions += '<button class="btn btn-xs btn-danger row-delete" type="button">' + t('delete') + '</button>';
    }
    actions += '</td>';
    result += actions;
  }

  result += '</tr>';
  return result;
};

addRowsToResultTable = function(rows) {
  var body = '<tbody>';
  rows.forEach(function(row) {
    body += row;
  });
  body += '</tbody>';
  $('#table_results').append(body);
};

resetResultTable = function() {
  $('#table_results').empty();
};

setActiveTab = function(name) {
  $('#navbar li.selected').removeClass('selected');
  $('#' + name).addClass('selected');
};

bytesToSize = function(bytes) {
  var i, sizes;
  sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return '0 Byte';
  }
  i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

getColumnsFromIndexSql = function(name, sql) {
  var i, match, matches, result;
  if (!sql) {
    return [];
  }
  i = sql.indexOf('"' + name + '"');
  sql = sql.slice(i + 1, sql.length - 1);
  matches = sql.match(/("[\w\s]+")/g);
  if (!matches) {
    return [];
  }
  result = [];
  for (i = 0; i < matches.length; i++) {
    match = matches[i];
    result.push(match.replace(/"/g, ''));
  }
  return result;
};

revertRowFromSnapshot = function($row) {
  var original, originalValues, rowIndex;
  rowIndex = parseInt($row.attr('data-row-index'), 10);
  original = rowSnapshots[rowIndex] || { values: [] };
  originalValues = $.isArray(original) ? original : (original.values || []);
  $row.find('.data-cell').each(function(idx) {
    $(this).text(formatCellValue(originalValues[idx]));
  });
};

cancelEditRow = function($row) {
  revertRowFromSnapshot($row);
  $row.find('.data-cell').attr('contenteditable', 'false');
  $row.find('.row-edit').show();
  $row.find('.row-save, .row-cancel').hide();
};

saveEditedRow = function($row) {
  var original, originalValues, rowIndex, setClauses, tableName, updatedValues, whereClauses;
  if (!currentTableContentName) {
    alert(t('no_target_table'));
    return;
  }

  rowIndex = parseInt($row.attr('data-row-index'), 10);
  original = rowSnapshots[rowIndex] || { values: [], rowid: null };
  originalValues = $.isArray(original) ? original : (original.values || []);
  updatedValues = [];

  $row.find('.data-cell').each(function() {
    updatedValues.push($(this).text());
  });

  tableName = escapeIdentifier(currentTableContentName);
  setClauses = currentTableContentColumns.map(function(colName, idx) {
    return escapeIdentifier(colName) + ' = ' + sqlValueLiteral(updatedValues[idx]);
  });

  if (currentTablePKColumns.length > 0) {
    whereClauses = currentTablePKColumns.map(function(pkCol) {
      var idx, v;
      idx = currentTableContentColumns.indexOf(pkCol);
      v = originalValues[idx];
      if (v === null || v === void 0) {
        return escapeIdentifier(pkCol) + ' IS NULL';
      }
      return escapeIdentifier(pkCol) + ' = ' + sqlValueLiteral(v);
    });
  } else if (!$.isArray(original) && original.rowid !== null && original.rowid !== void 0) {
    whereClauses = ['rowid = ' + sqlValueLiteral(original.rowid)];
  } else {
    whereClauses = currentTableContentColumns.map(function(colName, idx) {
      var v = originalValues[idx];
      if (v === null || v === void 0) {
        return escapeIdentifier(colName) + ' IS NULL';
      }
      return escapeIdentifier(colName) + ' = ' + sqlValueLiteral(v);
    });
  }

  executeQuery('UPDATE ' + tableName + ' SET ' + setClauses.join(', ') + ' WHERE ' + whereClauses.join(' AND ') + ';', function(data) {
    if (data.code === 'error') {
      alert(data.message || t('update_failed'));
      return;
    }

    rowSnapshots[rowIndex] = {
      rowid: $.isArray(original) ? null : original.rowid,
      values: updatedValues.slice()
    };
    $row.find('.data-cell').attr('contenteditable', 'false');
    $row.find('.row-edit').show();
    $row.find('.row-save, .row-cancel').hide();
    showTableInfo();
    alert(t('update_success'));
  });
};

saveNewRow = function($row) {
  var cols, tableName, vals;
  if (!currentTableContentName) {
    alert(t('no_target_table'));
    return;
  }

  vals = [];
  $row.find('.data-cell').each(function() {
    vals.push(sqlValueLiteral($(this).text()));
  });

  cols = currentTableContentColumns.map(function(c) { return escapeIdentifier(c); });
  tableName = escapeIdentifier(currentTableContentName);

  executeQuery('INSERT INTO ' + tableName + ' (' + cols.join(', ') + ') VALUES (' + vals.join(', ') + ');', function(data) {
    if (data.code === 'error') {
      alert(data.message || t('insert_failed'));
      return;
    }
    showTableContent();
    showTableInfo();
    alert(t('insert_success'));
  });
};

$(function() {
  var editor;
  var draggingQuerySplitter = false;
  editor = ace.edit('editor');
  editorInstance = editor;
  editor.setTheme('ace/theme/textmate');
  editor.getSession().setMode('ace/mode/sql');

  var preferredMode = window.localStorage.getItem('gobroem_lang_mode');
  if (!preferredMode) {
    // Compatibility with previous two-state version.
    var oldPreferredLanguage = window.localStorage.getItem('gobroem_lang');
    if (oldPreferredLanguage === 'zh' || oldPreferredLanguage === 'en') {
      preferredMode = oldPreferredLanguage;
    } else {
      preferredMode = 'auto';
    }
  }
  setLanguageMode(preferredMode, false);

  var preferredDensityMode = window.localStorage.getItem('gobroem_density_mode') || 'standard';
  setDensityMode(preferredDensityMode);
  loadQuerySplitRatio();
  loadQueryFavorites();
  loadQueryHistory();
  renderQueryHistory();
  ensureQueryActionButtonsEnabled();

  function runCurrentEditorQuery() {
    var query = $.trim(editor.getValue());
    if (query.length === 0) {
      return;
    }
    runQuery(query);
  }

  editor.commands.addCommand({
    name: 'runQueryShortcut',
    bindKey: {
      win: 'Ctrl-Enter',
      mac: 'Command-Enter'
    },
    exec: function() {
      runCurrentEditorQuery();
    }
  });

  $('#lang_mode').on('change', function() {
    setLanguageMode($(this).val(), true);
  });

  $('#density_mode').on('change', function() {
    setDensityMode($(this).val());
    setTimeout(applyQuerySplitLayout, 0);
  });

  $(window).on('resize', function() {
    applyQuerySplitLayout();
  });

  $('#query_splitter').on('mousedown', function(e) {
    e.preventDefault();
    draggingQuerySplitter = true;
    $('body').addClass('no-select');
  });

  $(document).on('mousemove', function(e) {
    if (!draggingQuerySplitter || !$('#content').hasClass('query-mode') || window.innerWidth <= 980) {
      return;
    }

    var workspace = $('#query_workspace');
    var splitterHeight = $('#query_splitter').outerHeight() || 10;
    var available = workspace.height() - splitterHeight;
    if (available < 360) {
      return;
    }

    var offsetY = e.pageY - workspace.offset().top;
    querySplitRatio = offsetY / available;
    querySplitRatio = Math.max(0.2, Math.min(querySplitRatio, 0.8));
    applyQuerySplitLayout();
  });

  $(document).on('mouseup', function() {
    if (draggingQuerySplitter) {
      draggingQuerySplitter = false;
      $('body').removeClass('no-select');
      saveQuerySplitRatio();
    }
  });

  $('#reset_query_layout').on('click', function() {
    querySplitRatio = defaultQuerySplitRatio;
    window.localStorage.removeItem('gobroem_query_split_ratio');
    applyQuerySplitLayout();
  });

  $('#tables').on('click', 'li', function() {
    $('#tables li.selected').removeClass('selected');
    $(this).addClass('selected');
    showTableInfo();
    showTableStructure();
  });

  $('#table_structure').on('click', function() { showTableStructure(); });
  $('#table_content').on('click', function() { showTableContent(); });
  $('#table_query').on('click', function() { showTableQuery(); });

  toggleSchemaTypeCustom($('#schema_add_type'), $('#schema_add_type_custom'));

  $('#schema_add_type').on('change', function() {
    toggleSchemaTypeCustom($('#schema_add_type'), $('#schema_add_type_custom'));
  });

  $('#table_columns').on('change', '.schema-inline-type-select', function() {
    var $row = $(this).closest('tr');
    toggleSchemaTypeCustom($(this), $row.find('.schema-inline-type-custom'));
  });

  $('#schema_add_column').on('click', function() {
    var tableName = $.trim($('#tables li.selected').text());
    var colName = $.trim($('#schema_add_name').val());
    var colType = getSchemaTypeValue($('#schema_add_type').val(), $('#schema_add_type_custom').val());
    var defaultValue = $('#schema_add_default').val();
    var defaultExpr = schemaDefaultExpr(defaultValue);
    var sql;
    var wantPK = $('#schema_add_pk').is(':checked');
    var wantAI = $('#schema_add_ai').is(':checked');

    if (!tableName) {
      alert(t('select_table_first'));
      return;
    }
    if (!colName || !colType) {
      alert(t('schema_invalid_name'));
      return;
    }

    if (!wantPK && !wantAI) {
      sql = 'ALTER TABLE ' + escapeIdentifier(tableName) + ' ADD COLUMN ' + escapeIdentifier(colName) + ' ' + colType;
      if ($('#schema_add_not_null').is(':checked')) {
        sql += ' NOT NULL';
      }
      if (defaultExpr) {
        sql += ' DEFAULT ' + defaultExpr;
      }
      sql += ';';
      applySchemaChange(sql, 'schema_add_column_success', tableName);
      return;
    }

    rebuildTableForAddColumn(tableName, {
      name: colName,
      type: colType,
      pk: wantPK,
      autoincrement: wantAI,
      notnull: $('#schema_add_not_null').is(':checked'),
      defaultExpr: defaultExpr
    });
  });

  $('#table_columns').on('click', '.schema-col-edit', function() {
    var $row = $(this).closest('tr');
    var name = $row.attr('data-col-name') || '';
    var type = $row.attr('data-col-type') || '';
    var notNull = $row.attr('data-col-notnull') === '1';
    var defVal = $row.attr('data-col-default') || '';

    $row.find('th').eq(0).html('<input type="text" class="form-control input-sm schema-inline-name" value="' + _.escape(name) + '">');
    $row.find('th').eq(1).html(buildSchemaTypeSelectHtml(type, 'schema-inline-type-select', 'schema-inline-type-custom'));
    $row.find('th').eq(3).html('<label class="schema-checkbox" style="margin:0;"><input type="checkbox" class="schema-inline-notnull"' + (notNull ? ' checked' : '') + '> ' + _.escape(t('schema_not_null')) + '</label>');
    $row.find('th').eq(4).html('<input type="text" class="form-control input-sm schema-inline-default" value="' + _.escape(defVal) + '">');

    $row.find('.schema-col-edit, .schema-col-drop').hide();
    $row.find('.schema-col-save, .schema-col-cancel').show();
  });

  $('#table_columns').on('click', '.schema-col-cancel', function() {
    showTableStructure();
  });

  $('#table_columns').on('click', '.schema-col-save', function() {
    var tableName = $.trim($('#tables li.selected').text());
    var $row = $(this).closest('tr');
    var sourceName = $row.attr('data-col-name') || '';
    var newName = $.trim($row.find('.schema-inline-name').val() || '');
    var newType = getSchemaTypeValue($row.find('.schema-inline-type-select').val(), $row.find('.schema-inline-type-custom').val());
    var newNotNull = $row.find('.schema-inline-notnull').is(':checked');
    var newDefaultExpr = schemaDefaultExpr($row.find('.schema-inline-default').val());

    if (!tableName) {
      alert(t('select_table_first'));
      return;
    }
    if (!newName || !newType) {
      alert(t('schema_invalid_name'));
      return;
    }

    rebuildTableForColumnUpdate(tableName, sourceName, {
      name: newName,
      type: newType,
      notnull: newNotNull,
      defaultExpr: newDefaultExpr
    }, 'schema_column_updated');
  });

  $('#table_columns').on('click', '.schema-col-drop', function() {
    var tableName = $.trim($('#tables li.selected').text());
    var dropName = $.trim($(this).closest('tr').find('[data-column-name]').text());
    var sql;

    if (!tableName) {
      alert(t('select_table_first'));
      return;
    }
    if (!dropName) {
      alert(t('schema_invalid_name'));
      return;
    }
    if (!window.confirm(tf('schema_confirm_drop_column', { name: dropName }))) {
      return;
    }

    sql = 'ALTER TABLE ' + escapeIdentifier(tableName) + ' DROP COLUMN ' + escapeIdentifier(dropName) + ';';
    applySchemaChange(sql, 'schema_drop_column_success', tableName);
  });

  $('#schema_rename_table').on('click', function() {
    var tableName = $.trim($('#tables li.selected').text());
    var nextName = $.trim($('#schema_rename_table_to').val());
    var sql;

    if (!tableName) {
      alert(t('select_table_first'));
      return;
    }
    if (!nextName) {
      alert(t('schema_invalid_name'));
      return;
    }
    if (!window.confirm(tf('schema_confirm_rename_table', { from: tableName, to: nextName }))) {
      return;
    }

    sql = 'ALTER TABLE ' + escapeIdentifier(tableName) + ' RENAME TO ' + escapeIdentifier(nextName) + ';';
    applySchemaChange(sql, 'schema_rename_table_success', nextName);
  });

  $('#schema_create_table').on('click', function() {
    var tableNameRaw = window.prompt(t('schema_create_table_name'), '');
    var tableName = $.trim(tableNameRaw);
    var columnsDef = 'id INTEGER PRIMARY KEY AUTOINCREMENT';
    var sql;

    if (tableNameRaw === null) {
      return;
    }
    if (!tableName) {
      alert(t('schema_invalid_name'));
      return;
    }

    sql = 'CREATE TABLE ' + escapeIdentifier(tableName) + ' (' + columnsDef + ');';
    if (!window.confirm(t('schema_create_preview_title') + '\n' + sql)) {
      return;
    }

    setSchemaSqlPreview([sql]);
    executeQuery(sql, function(data) {
      if (data.code === 'error') {
        alert(data.message || t('query_failed'));
        return;
      }

      alert(t('schema_create_table_success'));
      loadTables(function() {
        showTableStructure();
      }, tableName);
    });
  });

  $('#index_cancel_edit_btn').on('click', function() {
    resetIndexTools();
  });

  $('#index_save_btn').on('click', function() {
    var tableName = $.trim($('#tables li.selected').text());
    var indexName = $.trim($('#index_name_input').val());
    var columns = parseIndexColumns($('#index_columns_input').val());
    var unique = $('#index_unique_input').is(':checked');
    var createSql;

    if (!tableName) {
      alert(t('select_table_first'));
      return;
    }
    if (!indexName) {
      alert(t('index_name_required'));
      return;
    }
    if (!columns.length) {
      alert(t('index_columns_required'));
      return;
    }

    createSql = buildCreateIndexSQL(tableName, indexName, columns, unique);

    if (!indexEditTarget) {
      applySchemaChange(createSql, 'index_added', tableName);
      return;
    }

    executeSqlSeries([
      'DROP INDEX ' + escapeIdentifier(indexEditTarget.name) + ';',
      createSql
    ], function(errMsg) {
      if (errMsg) {
        alert(errMsg);
        return;
      }
      alert(t('index_updated'));
      resetIndexTools();
      loadTables(function() {}, tableName);
    });
  });

  $('#table_indexes').on('click', '.index-edit', function() {
    var $row = $(this).closest('tr');
    startIndexEdit({
      name: $.trim($row.attr('data-index-name') || ''),
      table: $.trim($row.attr('data-index-table') || ''),
      columns: parseIndexColumns($row.attr('data-index-columns') || ''),
      unique: $row.attr('data-index-unique') === '1'
    });
  });

  $('#table_indexes').on('click', '.index-delete', function() {
    var $row = $(this).closest('tr');
    var name = $.trim($row.attr('data-index-name') || '');
    var tableName = $.trim($('#tables li.selected').text());
    var dropSql;

    if (!name) {
      return;
    }
    if (!window.confirm(tf('index_confirm_delete', { name: name }))) {
      return;
    }

    dropSql = 'DROP INDEX ' + escapeIdentifier(name) + ';';
    applySchemaChange(dropSql, 'index_deleted', tableName);
  });

  $('#index_sql_modal').on('show.bs.modal', function(event) {
    var button, modal, sql, title;
    button = $(event.relatedTarget);
    title = button.data('name');
    sql = button.next('pre').text();
    modal = $(this);
    modal.find('.modal-title').text(title);
    modal.find('.modal-body pre').text(sql);
  });

  $('#run').on('click', function() {
    ensureQueryActionButtonsEnabled();
    runCurrentEditorQuery();
  });

  $('#run_primary').on('click', function() {
    ensureQueryActionButtonsEnabled();
    runCurrentEditorQuery();
  });

  $('#query_history').on('change', function() {
    var idx = parseInt($(this).val(), 10);
    if (isNaN(idx) || idx < 0 || idx >= queryHistoryRenderItems.length) {
      return;
    }

    editor.setValue(queryHistoryRenderItems[idx].sql, -1);
    editor.focus();
    $(this).val('');
  });

  $('#favorite_query').on('click', function() {
    var query = $.trim(editor.getValue());
    if (!query) {
      alert(t('query_empty_current_sql'));
      return;
    }
    if (queryFavorites.indexOf(query) !== -1) {
      alert(t('query_favorite_exists'));
      return;
    }

    queryFavorites.unshift(query);
    if (queryFavorites.length > maxQueryHistory) {
      queryFavorites = queryFavorites.slice(0, maxQueryHistory);
    }
    saveQueryFavorites();
    renderQueryHistory();
    alert(t('query_favorite_added'));
  });

  $('#clear_query_history').on('click', function() {
    queryHistory = [];
    window.localStorage.removeItem('gobroem_query_history');
    renderQueryHistory();
    alert(t('query_history_cleared'));
  });

  $('#export_csv').on('click', function() {
    var query = $.trim(editor.getValue());
    if (query.length === 0) { return; }
    exportCSV(query);
  });

  $('#export_json').on('click', function() {
    var query = $.trim(editor.getValue());
    if (query.length === 0) { return; }
    exportJSON(query);
  });

  $('#add_row').on('click', function() {
    if (!currentTableContentColumns.length) {
      alert(t('enter_table_content_first'));
      return;
    }

    if (!$('#table_results tbody').length) {
      $('#table_results').append('<tbody></tbody>');
    }

    var emptyRow = currentTableContentColumns.map(function() { return ''; });
    $('#table_results tbody').prepend(buildResultRow(emptyRow, void 0, true));
  });

  $('#refresh_rows').on('click', function() {
    showTableContent();
  });

  $('#table_results').on('click', '.row-edit', function() {
    var $row = $(this).closest('tr');
    $row.find('.data-cell').attr('contenteditable', 'true');
    $row.find('.row-edit').hide();
    $row.find('.row-save, .row-cancel').show();
    $row.find('.data-cell:first').focus();
  });

  $('#table_results').on('click', '.row-cancel', function() {
    cancelEditRow($(this).closest('tr'));
  });

  $('#table_results').on('click', '.row-save', function() {
    saveEditedRow($(this).closest('tr'));
  });

  $('#table_results').on('click', '.row-save-new', function() {
    saveNewRow($(this).closest('tr'));
  });

  $('#table_results').on('click', '.row-cancel-new', function() {
    $(this).closest('tr').remove();
  });

  $('#table_results').on('click', '.row-delete', function() {
    var $row, original, originalValues, rowIndex, tableName, whereClauses;
    if (!currentTableContentName) {
      alert(t('no_target_table'));
      return;
    }
    if (!window.confirm(t('confirm_delete_row'))) {
      return;
    }

    $row = $(this).closest('tr');
    rowIndex = parseInt($row.attr('data-row-index'), 10);
    original = rowSnapshots[rowIndex] || { values: [], rowid: null };
    originalValues = $.isArray(original) ? original : (original.values || []);
    tableName = escapeIdentifier(currentTableContentName);

    if (currentTablePKColumns.length > 0) {
      whereClauses = currentTablePKColumns.map(function(pkCol) {
        var idx = currentTableContentColumns.indexOf(pkCol);
        var v = originalValues[idx];
        if (v === null || v === void 0) {
          return escapeIdentifier(pkCol) + ' IS NULL';
        }
        return escapeIdentifier(pkCol) + ' = ' + sqlValueLiteral(v);
      });
    } else if (!$.isArray(original) && original.rowid !== null && original.rowid !== void 0) {
      whereClauses = ['rowid = ' + sqlValueLiteral(original.rowid)];
    } else {
      whereClauses = currentTableContentColumns.map(function(colName, idx) {
        var v = originalValues[idx];
        if (v === null || v === void 0) {
          return escapeIdentifier(colName) + ' IS NULL';
        }
        return escapeIdentifier(colName) + ' = ' + sqlValueLiteral(v);
      });
    }

    executeQuery('DELETE FROM ' + tableName + ' WHERE ' + whereClauses.join(' AND ') + ';', function(data) {
      if (data.code === 'error') {
        alert(data.message || t('delete_failed'));
        return;
      }
      showTableContent();
      showTableInfo();
      alert(t('delete_success'));
    });
  });

  $('#btn_auth_submit').on('click', function() {
    var password = $('#auth_password').val();
    var username = $.trim($('#auth_username').val());
    if (!username || !password) {
      alert(t('username_password_required'));
      return;
    }

    var path = authMode === 'setup' ? 'api/auth/setup' : 'api/auth/login';
    apiCall('POST', path, { username: username, password: password }, function(data) {
      if (data.code === 'error') {
        alert(data.message || t('login_failed'));
        return;
      }

      $('#current_username').text(data.username || username);
      $('#auth_modal').modal('hide');
      $('#main').show();
      loadTables(function() { showDatabaseInfo(); });
    });
  });

  $('#btn_logout').on('click', function() {
    apiCall('POST', 'api/auth/logout', {}, function(data) {
      if (data && data.code === 'error') {
        // Continue to clear UI even when backend session is already invalid.
        console.warn(data.message || 'logout failed');
      }
      $('#current_username').text('-');
      $('#main').hide();
      showAuthModal(true);
    });
  });

  $('#btn_account').on('click', function() {
    $('#account_modal').modal('show');
  });

  $('#save_account').on('click', function() {
    saveAccount();
  });

  initAuthFlow(function() {
    $('#main').show();
    loadTables(function() {
      showDatabaseInfo();
    });
  });
});
