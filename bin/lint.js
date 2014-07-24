(function (argv) {
    "use strict";
    load('bin/jslint.js');

    // Translator between (long) warning options and jslint options.
    var jsLintCLIVersion = '0.1',
        warningOptions = {
            'assignment-expressions'    : 'ass',
            'bitwise-operators'         : 'bitwise',
            'continue-statements'       : 'continue',
            'debug-statements'          : 'debug',
            'devel-statements'          : 'devel',
            'loose-equality'            : 'eqeq',
            'eval-statement'            : 'evil',
            'for-in-unfiltered'         : 'forin',
            'uncapitalized-constructors': 'newcap',
            'dangling-underscores'      : 'nomen',
            'plusplus'                  : 'plusplus',
            'insecure-regexps'          : 'regexp',
            'nonstrict-code'            : 'sloppy',
            'blocking-methods'          : 'stupid',
            'inefficient-subscripts'    : 'sub',
            'todo-comments'             : 'todo',
            'unused-parameter'          : 'unparam',
            'multiple-var'              : 'vars',
            'messy-whitespace'          : 'white'
        },
        flagOptions = {
            'browser-globals'       : 'browser',
            'closure-globals'       : 'closure',
            'couchdb-globals'       : 'globals',
            'nodejs-globals'        : 'nodejs',
            'rhino-globals'         : 'rhino'
        };

    function writeFile(path, content) {
        var f = new java.io.File(path),
            writer;
        if (!f.exists() || f.isFile()) {
            writer = new java.io.OutputStreamWriter(
                new java.io.FileOutputStream(f),
                'utf-8'
            );
            writer.write(content);
            writer.close();
        }
    }

    function getArguments(argv) {
        var i = 0,
            result = {
                'define'    : {},
                'flags'     : {},
                'files'     : [],
                'outputFile': '-'
            },
            fileMode = false,
            flag,
            parts;
        for (i = 0; i < argv.length; i += 1) {
            if (!!fileMode) {
                // File mode: all subsequent arguments are filenames.
                result.files.push(argv[i]);
            } else if (argv[i] === '-') {
                // Read from stdin
                result.files.push(null);
            } else if (argv[i] === '--') {
                // Turn file mode on.
                fileMode = true;
            } else if (argv[i].indexOf('-') !== 0) {
                // This is an input file.
                result.files.push(argv[i]);
            } else {
                // This should(?) be an option
                if (argv[i] === '--version') {
                    print('JSLint/CLI version ' + jsLintCLIVersion + ' by Beecher Greenman');
                    print('JSLint version ' + JSLINT.edition + ' by Douglas Crockford');
                    quit(0);
                } else if (argv[i].indexOf('-Wno-') === 0) {
                    // Suppress a warning.
                    flag = argv[i].substring(5);
                    if (warningOptions.hasOwnProperty(flag)) {
                        result.flags[warningOptions[flag]] = true;
                    } else {
                        result.files.push(argv[i]);
                    }
                } else if (argv[i].indexOf('-W') === 0) {
                    // Special case: -Wall, enable all warnings
                    if (argv[i] === '-Wall') {
                        for (flag in warningOptions) {
                            if (warningOptions.hasOwnProperty(flag)) {
                                result.flags[warningOptions[flag]] = false;
                            }
                        }
                    } else if (argv[i] === '-Werror') {
                        // Special case: -Werror, all warnings are errors
                        result.flags.passfail = true;
                    } else {
                        // Enable a warning.
                        flag = argv[i].substring(2);
                        if (warningOptions.hasOwnProperty(flag)) {
                            result.flags[warningOptions[flag]] = false;
                        } else {
                            result.files.push(argv[i]);
                        }
                    }
                } else if (argv[i].indexOf('-fno-') === 0) {
                    // Set a flag to false.
                    flag = argv[i].substring(5);
                    if (flagOptions.hasOwnProperty(flag)) {
                        result.flags[flagOptions[flag]] = false;
                    } else {
                        result.files.push(argv[i]);
                    }
                } else if (argv[i].indexOf('-f') === 0) {
                    // Special case: -fmax-errors
                    if (argv[i].indexOf('-fmax-errors=') === 0) {
                        result.flags.maxerr = parseInt(argv[i].substring(13), 10);
                    } else {
                        // Set a flag to true.
                        flag = argv[i].substring(2);
                        if (flagOptions.hasOwnProperty(flag)) {
                            result.flags[flagOptions[flag]] = true;
                        } else {
                            result.files.push(argv[i]);
                        }
                    }
                } else if (argv[i].indexOf('-D') === 0) {
                    // Define global.
                    flag = argv[i].substring(2);
                    if (flag.indexOf('=') === -1) {
                        result.define[flag] = false;
                    } else {
                        parts = flag.split('=', 1);
                        result.define[parts[0]] = Boolean(parts[1]);
                    }
                } else if (argv[i] === '-o') {
                    // Specify output file.
                    i += 1;     // NB: Changing loop variable inside loop
                    result.outputFile = argv[i];
                }
            }
        }
        return result;
    }

    function reportSuccess(outputFile, data) {
        var lines = [],
            i,
            j;
        for (i = 0; i < data.functions.length; i += 1) {
            lines.push(
                data.functions[i].name +
                ':LFDF::' +
                data.functions[i].line +
                ':' + data.functions[i].parameter.length +
                ':::' + data.functions[i]['var']
            );
            for (j = 0; j < data.functions[i]['var'].length; j += 1) {
                lines.push(
                    data.functions[i]['var'][j] +
                    ':' + 'LVDF' +
                    '::'
                );
            }
        }
        if (outputFile === '-') {
            print(lines.join('\n'));
        } else {
            writeFile(outputFile, lines.join('\n'));
        }
    }

    function reportErrors(source, errors) {
        var i, j, s;
        for (i = 0; i < errors.length; i += 1) {
            if (errors[i] !== null) {
                java.lang.System.err.println(source + ':' + errors[i].line + ': error: ' + errors[i].reason);
                if (errors[i].evidence) {
                    java.lang.System.err.println(errors[i].evidence);
                    s = '';
                    for (j = 1; j < errors[i].character; j += 1) {
                        s += '-';
                    }
                    s += '^';
                    java.lang.System.err.println(s);
                }
            }
        }
    }

    function main(argv) {
        var options = getArguments(argv),
            the_option = {},
            source,
            key,
            i,
            result;
        for (key in options.flags) {
            if (options.flags.hasOwnProperty(key)) {
                the_option[key] = options.flags[key];
            }
        }
        the_option.predef = options.define;
        if (options.files.length > 0) {
            for (i = 0; i < options.files.length; i += 1) {
                source = readFile(options.files[i]);
                result = JSLINT(source, the_option);
                if (!result) {
                    reportErrors(options.files[i], JSLINT.errors);
                } else {
                    reportSuccess(options.outputFile, JSLINT.data());
                }
            }
            quit(JSLINT.errors.length);
        } else {
            java.lang.System.err.println('jslint: fatal error: no input files');
            quit(1);
        }
    }

    main(argv);
}(arguments));
