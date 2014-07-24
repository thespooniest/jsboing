(function (argv) {
    "use strict";
    load('bin/acorn.js');
    load('bin/SyntaxTreeVisitor.js');

    // Translator between (long) warning options and jslint options.
    var jsldVersion = '0.1';
    /*function writeFile(path, content) {
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
    }*/

    function getArguments(argv) {
        var i = 0,
            result = {
                'includes'  : [],
                'inputFile' : '-',
                'outputFile': '-'
            },
            fileMode = false,
            flag;
        for (i = 0; i < argv.length; i += 1) {
            if (!!fileMode) {
                // File mode: all subsequent arguments are filenames.
                result.inputFile = (argv[i]);
            } else if (argv[i] === '-') {
                // Read from stdin
                result.inputFile = '-';
            } else if (argv[i] === '--') {
                // Turn file mode on.
                fileMode = true;
            } else if (argv[i].indexOf('-') !== 0) {
                // This is an input file.
                result.inputFile = argv[i];
            } else {
                // This should(?) be an option
                if (argv[i] === '--version') {
                    print('JSLD version ' + jsldVersion + ' by Beecher Greenman');
                    print('Acorn version ' + acorn.version + ' by Marijn Haverbeke');
                    quit(0);
                } else if (argv[i].indexOf('-I') === 0) {
                    flag = argv[i].substring(2);
                    result.includes.push(flag);
                } else if (argv[i].indexOf('-o') === 0) {
                    flag = argv[i].substring(2);
                    result.outputFile = flag;
                }
            }
        }
        return result;
    }

    function main(argv) {
        var options = getArguments(argv),
            source;
        if (options.inputFile !== '-') {
            source = readFile(options.inputFile);
        } else {
            throw new Error('Unsupported stdin');
        }
        print(JSON.stringify(acorn.parse(source), undefined, 4));
    }

    main(argv);
}(arguments));
