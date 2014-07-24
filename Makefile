SRCDIR:=src
BUILDDIR:=build
LINTDIR:=$(BUILDDIR)/lint
TESTDIR:=$(BUILDDIR)/test
SRCFILES:=$(wildcard $(SRCDIR)/*.js)
LINTFILES:=$(patsubst $(SRCDIR)/%.js,$(LINTDIR)/%.ln,$(SRCFILES))

MAIN:=$(BUILDDIR)/boing.js

RHINO:=rhino
JSLINT:=$(RHINO) bin/lint.js
JSLINTFLAGS:=-fbrowser-globals -Wno-bitwise-operators -Dconsole -Ddefine -Drequire

YUICOMPRESSOR:=yui-compressor
YCFLAGS:=

.PHONY: all install help clean test help

all: $(MAIN)

help:
	@echo $(SRCFILES)
	@echo $(LINTFILES)

install: $(MAIN)
	cp $(MAIN) .
	$(YUICOMPRESSOR) $(YCFLAGS) $(MAIN) -o boing.min.js
	gzip -c boing.min.js > boing.min.js.gz

clean:
	rm -f boing.js boing.min.js boing.min.js.gz
	rm -rf $(BUILDDIR)

$(LINTDIR)/%.ln: $(SRCDIR)/%.js $(LINTDIR)
	$(JSLINT) $(JSLINTFLAGS) $< > $@

$(BUILDDIR):
	mkdir $(BUILDDIR)

$(LINTDIR): $(BUILDDIR)
	mkdir $(LINTDIR)

$(MAIN): $(LINTFILES)
	cat $(SRCDIR)/modules.js $(SRCDIR)/Machine.js $(SRCDIR)/ruy.js $(SRCDIR)/pipeline3d.js $(SRCDIR)/assets.js $(SRCDIR)/BoingWorld.js $(SRCDIR)/main.js > $@
