var SyntaxTreeVisitor = function () {
    "use strict";
    /**
     * An object for walking syntax trees.
     *
     * This is a sort of mutated version of the Visitor pattern:
     *   - The same object implements accept() and the visit() family.
     *   - Dispatch over the visit() family is done by node.type.
     * This is done in order to apply the pattern to the Mozilla parser API.
     *
     * @constructor
     * @this SyntaxTreeVisitor
     */
    function SyntaxTreeVisitor() {
    }

    SyntaxTreeVisitor.dispatcher = {
        "AssignmentExpression" : "visitAssignmentExpression",
        "ArrayExpression" : "visitArrayExpression",
        "ArrayPattern" : "visitArrayPattern",
        "ArrowFunctionExpression" : "visitArrayPattern",
        "BlockStatement" : "visitBlockStatement",
        "BinaryExpression" : "visitBinaryExpression",
        "BreakStatement" : "visitBreakStatement",
        "CallExpression" : "visitCallExpression",
        "CatchClause" : "visitCatchClause",
        "ComprehensionBlock" : "visitComprehensionBlock",
        "ComprehensionExpression" : "visitComprehensionExpression",
        "ConditionalExpression" : "visitConditionalExpression",
        "ContinueStatement" : "visitContinueStatement",
        "DirectiveStatement" : "visitDirectiveStatement",
        "DoWhileStatement" : "visitDoWhileStatement",
        "DebuggerStatement" : "visitDebuggerStatement",
        "EmptyStatement" : "visitEmptyStatement",
        "ExportDeclaration" : "visitExportDeclaration",
        "ExpressionStatement" : "visitExpressionStatement",
        "ForStatement" : "visitForStatement",
        "ForInStatement" : "visitForInStatement",
        "ForOfStatement" : "visitForOfStatement",
        "FunctionDeclaration" : "visitFunctionDeclaration",
        "FunctionExpression" : "visitFunctionExpression",
        "GeneratorExpression" : "visitGeneratorExpression",
        "Identifier" : "visitIdentifier",
        "IfStatement" : "visitIfStatement",
        "ImportDeclaration" : "visitImportDeclaration",
        "Literal" : "visitLiteral",
        "LabeledStatement" : "visitLabeledStatement",
        "LogicalExpression" : "visitLogicalExpression",
        "MemberExpression" : "visitMemberExpression",
        "NewExpression" : "visitNewExpression",
        "ObjectExpression" : "visitObjectExpression",
        "ObjectPattern" : "visitObjectPattern",
        "Program" : "visitProgram",
        "Property" : "visitProperty",
        "ReturnStatement" : "visitReturnStatement",
        "SequenceExpression" : "visitSequenceExpression",
        "SwitchStatement" : "visitSwitchStatement",
        "SwitchCase" : "visitSwitchCase",
        "ThisExpression" : "visitThisExpression",
        "ThrowStatement" : "visitThrowStatement",
        "TryStatement" : "visitTryStatement",
        "UnaryExpression" : "visitUnaryExpression",
        "UpdateExpression" : "visitUpdateExpression",
        "VariableDeclaration" : "visitVariableDeclaration",
        "VariableDeclarator" : "visitVariableDeclarator",
        "WhileStatement" : "visitWhileStatement",
        "WithStatement" : "visitWithStatement",
        "YieldExpression" : "visitYieldExpression"
    };

    /**
     * Take in a Node and decide which visit()-family function to call.
     *
     * @param {Object} node The node to visit.
     */
    SyntaxTreeVisitor.prototype.accept = function (node) {
        if (!node.hasOwnProperty('type')) {
            raise new TypeError("Cannot accept node without type");
        }
        if (!SyntaxTreeVisitor.dispatcher.hasOwnProperty(node.type)) {
            raise new TypeError("Unknown node type: " + node.type);
        }
        return this[node.type](node);
    };

    /**
     * The visit____ family of functions
     *
     * @param {Object} node The node being visited.
     */

    SyntaxTreeVisitor.prototype.visitAssignmentExpression = function (node) {
        this.accept(node.left);
        this.accept(node.right);
    };

    SyntaxTreeVisitor.prototype.visitArrayExpression = function (node) {
        var i;
        for (i = 0; i < node.elements.length; i += 1) {
            this.accept(node.elements[i]);
        }
    };

    SyntaxTreeVisitor.prototype.visitArrayPattern = function (node) {
        var i;
        for (i = 0; i < node.elements.length; i += 1) {
            this.accept(node.elements[i]);
        }
    };

    SyntaxTreeVisitor.prototype.visitArrowFunctionExpression = function (node) {
        var i;
        for (i = 0; i < node.params.length; i += 1) {
            this.accept(node.params);
        }
        for (i = 0; i < node.defaults.length; i += 1) {
            this.accept(node.defaults);
        }
        if (node.hasOwnProperty('rest') && !!node.rest) {
            this.accept(node.rest);
        }
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitBlockStatement = function (node) {
        var i;
        for (i = 0; i < node.body.length; i += 1) {
            this.accept(node.body[i]);
        }
    };

    SyntaxTreeVisitor.prototype.visitBinaryExpression = function (node) {
        this.accept(node.left);
        this.accept(node.right);
    };

    SyntaxTreeVisitor.prototype.visitBreakStatement = function (node) {
        if (node.hasOwnProperty('label') && !!node.label) {
            this.accept(node.label);
        }
    };

    SyntaxTreeVisitor.prototype.visitCallExpression = function (node) {
        var i;
        this.accept(node.callee);
        for (i = 0; i < node.arguments.length; i += 1) {
            this.accept(node.arguments[i]);
        }
    };

    SyntaxTreeVisitor.prototype.visitCatchClause = function (node) {
        this.accept(node.param);
        if (node.hasOwnProperty('guard') && !!node.guard) {
            this.accept(node.guard);
        }
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitComprehensionBlock = function (node) {
        this.accept(node.left);
        this.accept(node.right);
    };

    SyntaxTreeVisitor.prototype.visitComprehensionExpression = function (node) {
        var i;
        this.accept(node.body);
        for (i = 0; i < node.blocks.length; i += 1) {
            this.accept(node.blocks[i]);
        }
        if (node.hasOwnProperty('filter') && !!node.filter) {
            this.accept(node.filter);
        }
    };

    SyntaxTreeVisitor.prototype.visitConditionalExpression = function (node) {
        this.accept(node.test);
        this.accept(node.cons);
        this.accept(node.alt);
    };

    SyntaxTreeVisitor.prototype.visitContinueStatement = function (node) {
        if (node.hasOwnProperty('label') && !!node.label) {
            this.accept(node.label);
        }
    };

    SyntaxTreeVisitor.prototype.visitDirectiveStatement = function (node) {
        this.accept(node.directive);
    };

    SyntaxTreeVisitor.prototype.visitDoWhileStatement = function (node) {
        this.accept(node.body);
        this.accept(node.test);
    };

    SyntaxTreeVisitor.prototype.visitDebuggerStatement = function (node) {
        /*jslint unparam:true */
        return;
    };

    SyntaxTreeVisitor.prototype.visitEmptyStatement = function (node) {
        /*jslint unparam:true */
        return;
    };

    SyntaxTreeVisitor.prototype.visitExportDeclaration = function (node) {
        this.accept(node.declaration);
    };

    SyntaxTreeVisitor.prototype.visitExpressionStatement = function (node) {
        this.accept(node.expression);
    };

    SyntaxTreeVisitor.prototype.visitForStatement = function (node) {
        if (node.hasOwnProperty('init') && !!node.init) {
            this.accept(node.init);
        }
        if (node.hasOwnProperty('test') && !!node.test) {
            this.accept(node.test);
        }
        if (node.hasOwnProperty('update') && !!node.update) {
            this.accept(node.update);
        }
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitForInStatement = function (node) {
        this.accept(node.left);
        this.accept(node.right);
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitForOfStatement = function (node) {
        this.accept(node.left);
        this.accept(node.right);
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitFunctionDeclaration = function (node) {
        var i;
        this.accept(node.id);
        for (i = 0; i < node.params.length; i += 1) {
            this.accept(node.params);
        }
        for (i = 0; i < node.defaults.length; i += 1) {
            this.accept(node.defaults);
        }
        if (node.hasOwnProperty('rest') && !!node.rest) {
            this.accept(node.rest);
        }
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitFunctionExpression = function (node) {
        var i;
        if (node.hasOwnProperty('id') && !!node.id) {
            this.accept(node.id);
        }
        for (i = 0; i < node.params.length; i += 1) {
            this.accept(node.params);
        }
        for (i = 0; i < node.defaults.length; i += 1) {
            this.accept(node.defaults);
        }
        if (node.hasOwnProperty('rest') && !!node.rest) {
            this.accept(node.rest);
        }
        this.accept(node.body);
    };

    SyntaxTreeVisitor.prototype.visitGeneratorExpression = function (node) {
        var i;
        this.accept(node.body);
        if (node.hasOwnProperty('id') && !!node.id) {
            this.accept(node.id);
        }
        for (i = 0; i < node.blocks.length; i += 1) {
            this.accept(node.blocks);
        }
        if (node.hasOwnProperty('filter') && !!node.filter) {
            this.accept(node.filter);
        }
    };

    SyntaxTreeVisitor.prototype.visitIdentifier = function (node) {
        var i;
        this.accept(node.body);
        if (node.hasOwnProperty('id') && !!node.id) {
            this.accept(node.id);
        }
        for (i = 0; i < node.blocks.length; i += 1) {
            this.accept(node.blocks);
        }
        if (node.hasOwnProperty('filter') && !!node.filter) {
            this.accept(node.filter);
        }
    };

    return SyntaxTreeVisitor;
});
