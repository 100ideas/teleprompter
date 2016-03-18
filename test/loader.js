'use strict';

var path = require('path');
var stream = require('stream');
var Promise = require('bluebird');
var loadStreamBody = require('raw-body');
var tape = require('tape');
var createLoader = require('../lib/loader');

tape.test('Loader', function (suite) {
  var loader = createLoader(path.resolve(__dirname, 'fixture/loader'));

  suite.test('constructor defaults to cwd', function (t) {
    var subject = createLoader();

    t.equal(subject.dirname, process.cwd());

    t.end();
  });

  suite.test('constructor accepts relative path', function (t) {
    var subject = createLoader('relative');

    t.equal(subject.dirname, path.join(process.cwd(), 'relative'));

    t.end();
  });

  suite.test('constructor accepts absolute path', function (t) {
    var subject = createLoader('/absolute');

    t.equal(subject.dirname, '/absolute');

    t.end();
  });

  suite.test('constructor returns loader function', function (t) {
    var subject = createLoader();

    t.ok(typeof subject === 'function');

    t.end();
  });

  suite.test('loader returns a Promise', function (t) {
    var subject = loader('test');

    t.ok(subject instanceof Promise);

    t.end();
    subject.catch(function noop() {});
  });

  suite.test('loader rejects bogus name', function (t) {
    loader('obviously-does-not-exist')
      .then(function () {
        t.end(new Error('Should have failed.'));
      }, function (err) {
        t.ok(err);

        t.end();
      });
  });

  suite.test('loader loads html', function (t) {
    loader('html-only')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'html-only.html'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads html as stream', function (t) {
    loader('html-only')
      .then(function (subject) {
        t.ok(subject instanceof stream.Stream);
        t.ok(typeof subject.read === 'function', 'has read function');
        t.ok(typeof subject.pipe === 'function', 'has pipe function');
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads md', function (t) {
    loader('md-only')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'md-only.md'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads md as stream', function (t) {
    loader('md-only')
      .then(function (subject) {
        t.ok(subject instanceof stream.Stream);
        t.ok(typeof subject.read === 'function', 'has read function');
        t.ok(typeof subject.pipe === 'function', 'has pipe function');
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads markdown', function (t) {
    loader('markdown-only')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'markdown-only.markdown'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads markdown as stream', function (t) {
    loader('markdown-only')
      .then(function (subject) {
        t.ok(subject instanceof stream.Stream);
        t.ok(typeof subject.read === 'function', 'has read function');
        t.ok(typeof subject.pipe === 'function', 'has pipe function');
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads txt', function (t) {
    loader('txt-only')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'txt-only.txt'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader loads txt as stream', function (t) {
    loader('txt-only')
      .then(function (subject) {
        t.ok(subject instanceof stream.Stream);
        t.ok(typeof subject.read === 'function', 'has read function');
        t.ok(typeof subject.pipe === 'function', 'has pipe function');
      })
      .then(t.end, t.end);
  });

  suite.test('loader prefers html', function (t) {
    loader('priority-html')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'priority-html.html'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader prefers md', function (t) {
    loader('priority-md')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'priority-md.md'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader prefers markdown', function (t) {
    loader('priority-markdown')
      .then(function (subject) {
        t.equal(subject.path, path.join(loader.dirname, 'priority-markdown.markdown'));
      })
      .then(t.end, t.end);
  });

  suite.test('loader parses md', function (t) {
    loader('md-only')
      .then(function (subject) {
        return loadStreamBody(subject);
      })
      .then(function (body) {
        t.equal(String(body.slice(0, 3)), '<p>');
      })
      .then(t.end, t.end);
  });

  suite.test('loader parses markdown', function (t) {
    loader('markdown-only')
      .then(function (subject) {
        return loadStreamBody(subject);
      })
      .then(function (body) {
        t.equal(String(body.slice(0, 3)), '<p>');
      })
      .then(t.end, t.end);
  });

  suite.test('loader parses txt', function (t) {
    loader('txt-only')
      .then(function (subject) {
        return loadStreamBody(subject);
      })
      .then(function (body) {
        t.equal(String(body.slice(0, 3)), '<p>');
      })
      .then(t.end, t.end);
  });

  suite.test('loader preserves html', function (t) {
    loader('html-only')
      .then(function (subject) {
        return loadStreamBody(subject);
      })
      .then(function (body) {
        t.equal(String(body.slice(0, 3)), '<p>');
      })
      .then(t.end, t.end);
  });

  suite.test('loader returns directory listing without name', function (t) {
    loader()
      .then(function (subject) {
        t.notEqual(subject.indexOf('html-only'), -1);
        t.equal(subject.indexOf('bogus-name'), -1);
      })
      .then(t.end, t.end);
  });

  suite.test('loader directory listing removes duplicates', function (t) {
    loader()
      .then(function (subject) {
        t.notEqual(subject.indexOf('priority-html'), -1);

        subject.splice(subject.indexOf('priority-html'), 1);

        t.equal(subject.indexOf('priority-html'), -1);
      })
      .then(t.end, t.end);
  });
});
