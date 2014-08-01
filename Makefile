SRCDIR:=src
BUILDDIR:=build
LINTDIR:=$(BUILDDIR)/lint
TESTDIR:=$(BUILDDIR)/test
SRCFILES:=$(wildcard $(SRCDIR)/*.js)
LINTFILES:=$(patsubst $(SRCDIR)/%.js,$(LINTDIR)/%.ln,$(SRCFILES))

MAIN:=$(BUILDDIR)/boing.js

RHINO:=rhino
JSLINT:=$(RHINO) bin/lint.js
JSLINTFLAGS:=-fbrowser-globals -Wno-bitwise-operators -Ddefine -Drequire -Dconsole

YUICOMPRESSOR:=yui-compressor
YCFLAGS:=

GZIP:=/usr/bin/env gzip
GZFLAGS:=-9


all: $(MAIN)

help:
	@echo $(SRCFILES)
	@echo $(LINTFILES)

install: $(MAIN)
	cp $(MAIN) .
	$(YUICOMPRESSOR) $(YCFLAGS) $(MAIN) -o boing.min.js
	$(GZIP) $(GZFLAGS) -c boing.min.js > boing.min.js.gz

clean:
	rm -f boing.js boing.min.js boing.min.js.gz
	rm -rf $(BUILDDIR)

$(LINTDIR)/%.ln: $(SRCDIR)/%.js $(BUILDDIR)
	$(JSLINT) $(JSLINTFLAGS) $< > $@

$(BUILDDIR):
	mkdir $(BUILDDIR)
	mkdir $(LINTDIR)

$(MAIN): $(LINTFILES)
	cat $(SRCDIR)/modules.js $(SRCDIR)/Machine.js $(SRCDIR)/ruy.js $(SRCDIR)/pipeline3d.js $(SRCDIR)/assets.js $(SRCDIR)/BoingWorld.js $(SRCDIR)/main.js > $@

.PHONY: all install help clean test help
