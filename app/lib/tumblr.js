(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],4:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],5:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":3,"./encode":4}],6:[function(require,module,exports){
var fs = require('fs');
var qs = require('querystring');

function TumblrClient(credentials) {
  this.credentials = credentials || {};
}

var request;

module.exports = {

  Client: TumblrClient,

  createClient: function (credentials) {
    return new TumblrClient(credentials);
  },

  request: function(r) {
    request = r;
  }

};

var baseURL = 'http://api.tumblr.com/v2';
var version = require('../package.json').version;

var calls = {

  postCreation: function (type, requireOptions, acceptsData) {
    return function (blogName, options, callback) {
      requireValidation(options, requireOptions);
      options.type = type;
      if (!acceptsData) {
        delete options.data;
      }
      this._post(blogPath(blogName, '/post'), options, callback);
    };
  },

  getWithOptions: function (path) {
    return function (options, callback) {
      if (isFunction(options)) { callback = options; options = {}; }
      this._get(path, options, callback);
    };
  },

  blogList: function (path) {
    return function (blogName, options, callback) {
      if (isFunction(options)) { callback = options; options = {}; }
      this._get(blogPath(blogName, path), options, callback);
    };
  }

};

TumblrClient.prototype = {

  // Tagged

  tagged: function (tag, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }

    options = options || {};
    options.tag = tag;

    this._get('/tagged', options, callback, true);
  },

  // Blogs

  blogInfo: function (blogName, callback) {
    this._get(blogPath(blogName, '/info'), {}, callback, true);
  },

  avatar: function (blogName, size, callback) {
    if (isFunction(size)) { callback = size; size = null; }
    var path = size ? '/avatar/' + size : '/avatar';
    this._get(blogPath(blogName, path), {}, callback, true);
  },

  blogLikes: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    this._get(blogPath(blogName, '/likes'), options, callback, true);
  },

  followers: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    this._get(blogPath(blogName, '/followers'), options, callback);
  },

  posts: function (blogName, options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    options = options || {};
    var path = options.type ? '/posts/' + options.type : '/posts';
    this._get(blogPath(blogName, path), options, callback, true);
  },

  queue:       calls.blogList('/posts/queue'),
  drafts:      calls.blogList('/posts/draft'),
  submissions: calls.blogList('/posts/submission'),

  // Posts

  edit: function (blogName, options, callback) {
    this._post(blogPath(blogName, '/post/edit'), options, callback);
  },

  reblog: function (blogName, options, callback) {
    this._post(blogPath(blogName, '/post/reblog'), options, callback);
  },

  deletePost: function (blogName, id, callback) {
    this._post(blogPath(blogName, '/post/delete'), {id: id}, callback);
  },

  photo: calls.postCreation('photo', ['data', 'source'],       true),
  audio: calls.postCreation('audio', ['data', 'external_url'], true),
  video: calls.postCreation('video', ['data', 'embed'],        true),
  quote: calls.postCreation('quote', ['quote'],                false),
  text:  calls.postCreation('text',  ['body'],                 false),
  link:  calls.postCreation('link',  ['url'],                  false),
  chat:  calls.postCreation('chat',  ['conversation'],         false),

  // User

  userInfo: function (callback) {
    this._get('/user/info', {}, callback);
  },

  likes: function (options, callback) {
    if (isFunction(options)) { callback = options; options = {}; }
    this._get('/user/likes', options, callback);
  },

  follow: function (url, callback) {
    this._post('/user/follow', {url: url}, callback);
  },

  unfollow: function (url, callback) {
    this._post('/user/unfollow', {url: url}, callback);
  },

  like: function (id, reblogKey, callback) {
    this._post('/user/like', {id: id, reblog_key: reblogKey}, callback);
  },

  unlike: function (id, reblogKey, callback) {
    this._post('/user/unlike', {id: id, reblog_key: reblogKey}, callback);
  },

  dashboard: calls.getWithOptions('/user/dashboard'),
  following: calls.getWithOptions('/user/following'),

  // Helpers

  _get: function (path, params, callback, addApiKey) {

    params = params || {};
    if (addApiKey) {
      params.api_key = this.credentials.consumer_key;
    }

    request.get({
      url: baseURL + path + '?' + qs.stringify(params),
      json: true,
      oauth: this.credentials,
      followRedirect: false,
      headers : {
        'User-Agent' : 'tumblr.js/' + version
      }
    }, requestCallback(callback));

  },

  _post: function (path, params, callback) {

    var data = params.data;
    delete params.data;

    // Sign without multipart data
    var r = request.post({
      url : baseURL + path,
      headers :  {
        'User-Agent' : 'tumblr.js/' + version
      }
    }, function (err, response, body) {
      try { body = JSON.parse(body); } catch (e) { body = { error: 'Malformed Response: ' + body }; }
      requestCallback(callback)(err, response, body);
    });

    // Sign it with the non-data parameters
    r.form(params);
    r.oauth(this.credentials);

    // Clear the side effects from form(param)
    delete r.headers['content-type'];
    delete r.body;

    // And then add the full body
    var form = r.form();
    for (var key in params) {
      form.append(key, params[key]);
    }
    if (data) {
      form.append('data', fs.createReadStream(data));
    }

    // Add the form header back
    var headers = form.getHeaders();
    for (key in headers) {
      r.headers[key] = headers[key];
    }

  }

};

var requireValidation = function (options, choices) {
  var count = 0;
  for (var i = 0; i < choices.length; i++) {
    if (options[choices[i]]) {
      count += 1;
    }
  }
  if (choices.length === 1) {
    if (count === 0) {
      throw new Error('Missing required field: "' + choices[0] + '"');
    }
  } else if (choices.length > 1) {
    if (count === 0) {
      throw new Error('Missing one of: ' + choices.join(','));
    }
    if (count > 1) {
      throw new Error('Can only use one of: ' + choices.join(','));
    }
  }
};

function blogPath(blogName, path) {
  var bn = blogName.indexOf('.') !== -1 ? blogName : blogName + '.tumblr.com';
  return '/blog/' + bn + path;
}

function requestCallback(callback) {
  if (!callback) return undefined;
  return function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode >= 400) {
      var errString = body.meta ? body.meta.msg : body.error;
      return callback(new Error('API error: ' + response.statusCode + ' ' + errString));
    }
    if (body && body.response) {
      return callback(null, body.response);
    } else {
      return callback(new Error('API error (malformed API response): ' + body));
    }
  };
}

function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

},{"../package.json":7,"fs":2,"querystring":5}],7:[function(require,module,exports){
module.exports={
  "author": {
    "name": "Tumblr"
  },
  "contributors": [
    {
      "name": "Bryan Irace",
      "email": "bryan.irace@gmail.com"
    },
    {
      "name": "John Crepezzi",
      "email": "john.crepezzi@gmail.com"
    }
  ],
  "name": "tumblr.js",
  "description": "Official JavaScript client for the Tumblr API",
  "homepage": "https://github.com/tumblr/tumblr.js",
  "version": "0.0.5",
  "repository": {
    "url": "https://github.com/tumblr/tumblr.js"
  },
  "browserify": "browser/index.js",
  "bin": {
    "tumblr": "./bin/repl.js"
  },
  "main": "./index",
  "dependencies": {
    "request": "2.12.0"
  },
  "devDependencies": {
    "mocha": "*",
    "should": "*",
    "jscoverage": "*",
    "jsl": "*"
  },
  "optionalDependencies": {},
  "engines": {
    "node": "*"
  },
  "scripts": {
    "test": "mocha -r should test/*_spec.js"
  },
  "gitHead": "9608353c0473e617ee931f4e06a615b39647e5f2",
  "readme": "# tumblr.js\n\n[![Build Status](https://secure.travis-ci.org/tumblr/tumblr.js.png)](http://travis-ci.org/tumblr/tumblr.js)\n\nJavaScript client library for the\n[Tumblr API](http://www.tumblr.com/docs/en/api/v2) /\nnpm: https://npmjs.org/package/tumblr.js\n\n## Create a Client\n\n``` javascript\nvar tumblr = require('tumblr.js');\nvar client = tumblr.createClient({\n  consumer_key: '<consumer key>',\n  consumer_secret: '<consumer secret>',\n  token: '<oauth token>',\n  token_secret: '<oauth token secret>'\n});\n```\n\nOr, if you prefer:\n\n``` javascript\nvar tumblr = require('tumblr.js');\nvar client = new tumblr.Client({\n\t// ...\n});\n```\n\n## Example\n\n``` javascript\n// Show user's blog names\nclient.userInfo(function (err, data) {\n\tdata.user.blogs.forEach(function (blog) {\n\t\tconsole.log(blog.name);\n\t});\n});\n```\n\n## Supported Methods\n\nBelow is a list of available methods and their purpose.  Available options\nare documented on http://www.tumblr.com/docs/en/api/v2 and are specified as\na JavaScript object, for example:\n\n``` javascript\nclient.posts('seejohnrun', { type: 'photo' }, function (err, resp) {\n  resp.posts; // use them for something\n});\n```\n\nIn most cases, since options are optional (heh) they are also an optional\nargument, so there is no need to pass an empty object when supplying no options,\nlike:\n\n``` javascript\nclient.posts('seejohnrun', function (err, resp) {\n  resp.posts; // now we've got all kinds of posts\n});\n```\n\n\n### User Methods\n\n``` javascript\n// Get information about the authenticating user & their blogs\nclient.userInfo(callback);\n\n// Get dashboard for authenticating user\nclient.dashboard(options, callback);\nclient.dashboard(callback);\n\n// Get likes for authenticating user\nclient.likes(options, callback);\nclient.likes(callback);\n\n// Get followings for authenticating user\nclient.following(options, callback);\nclient.following(callback);\n\n// Follow or unfollow a given blog\nclient.follow(blogURL, callback);\nclient.unfollow(blogURL, callback);\n\n// Like or unlike a given post\nclient.like(id, reblogKey, callback);\nclient.unlike(id, reblogKey, callback);\n```\n\n### Blog Methods\n\n``` javascript\n// Get information about a given blog\nclient.blogInfo(blogName, callback);\n\n// Get a list of posts for a blog (with optional filtering)\nclient.posts(blogName, options, callback);\nclient.posts(blogName, callback);\n\n// Get the avatar URL for a blog\nclient.avatar(blogName, size, callback);\nclient.avatar(blogName, callback);\n\n// Get the likes for a blog\nclient.blogLikes(blogName, options, callback);\nclient.blogLikes(blogName, callback);\n\n// Get the followers for a blog\nclient.followers(blogName, options, callback);\nclient.followers(blogName, callback);\n\n// Get the queue for a blog\nclient.queue(blogName, options, callback);\nclient.queue(blogName, callback);\n\n// Get the drafts for a blog\nclient.drafts(blogName, options, callback);\nclient.drafts(blogName, callback);\n\n// Get the submissions for a blog\nclient.submissions(blogName, options, callback);\nclient.submissions(blogName, callback);\n```\n\n### Post Methods\n\n``` javascript\n// Edit a given post\nclient.edit(blogName, options, callback);\n\n// Reblog a given post\nclient.reblog(blogName, options, callback);\n\n// Delete a given psot\nclient.deletePost(blogName, id, callback);\n\n// Convenience methods for creating post types\nclient.photo(blogName, options, callback);\nclient.quote(blogName, options, callback);\nclient.text(blogName, options, callback);\nclient.link(blogName, options, callback);\nclient.chat(blogName, options, callback);\nclient.audio(blogName, options, callback);\nclient.video(blogName, options, callback);\n```\n\n### Tagged Methods\n\n``` javascript\n// View posts tagged with a certain tag\nclient.tagged(tag, options, callback);\nclient.tagged(tag, callback);\n```\n\n---\n\n## Running tests\n\n``` bash\nmake # run tests\nmake coverage # run coverage report\n```\n\n# Copyright and license\n\nCopyright 2013 Tumblr, Inc.\n\nLicensed under the Apache License, Version 2.0 (the \"License\"); you may not\nuse this work except in compliance with the License. You may obtain a copy of\nthe License in the LICENSE file, or at:\n\nhttp://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT\nWARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the\nLicense for the specific language governing permissions and limitations.\n",
  "readmeFilename": "README.md",
  "bugs": {
    "url": "https://github.com/tumblr/tumblr.js/issues"
  },
  "_id": "tumblr.js@0.0.5",
  "_shasum": "bef1338fef975528ab26026d8eaeba68d94113e5",
  "_from": "../../../../../../../var/folders/0f/5ty12z0d6pl55tss073_1kf00000gn/T/npm-15032-51c14b54/git-cache-9bc98222ec37/9608353c0473e617ee931f4e06a615b39647e5f2",
  "_resolved": "git://github.com/tumblr/tumblr.js#9608353c0473e617ee931f4e06a615b39647e5f2"
}

},{}],8:[function(require,module,exports){
var tumblr = require('../lib/tumblr');
tumblr.request(require('browser-request'));

module.exports = tumblr;

},{"../lib/tumblr":6,"browser-request":1}]},{},[8]);
